"""UniDorm matching algorithm: how well two students, or a room of 2-4 students, fit together.

This module is independent of the API. The scoring functions work on plain data, so they can be tested
and explained on their own; `load_profiles` and `load_questionnaire` read that data from the database.

How a pair is scored (see docs/MATCHING_ALGORITHM.md for the full explanation):

1. Every questionnaire answer is an option a-d. Options are ordered, so each answer is a step 1-4
   (`SurveyOption.value`); `level()` turns it into 0.0-1.0.
2. Each category has three scoring rules (one per question, sometimes combining two questions).
   A rule gives 0-100. Two kinds of rule are used:
   - closeness: the two answers should be similar. Score by how many steps apart they are:
     0 steps -> 100, 1 -> 70, 2 -> 30, 3 -> 0. A big difference costs much more than a small one.
   - clash: one student's need against the other student's habit, checked both ways
     (e.g. "needs complete quiet" against "listens to music on speakers"). A clash only starts when
     need + habit > 1, so "mostly quiet" and "usually headphones" do not clash, but
     "completely quiet" and "usually speakers" do.
3. Category score = weighted average of its rules (0-100).
4. Overall = sleep x 0.25 + noise x 0.20 + cleanliness x 0.20 + visitors x 0.20 + study x 0.15.
5. Missing answers are never treated as compatible: a rule that needs a missing answer scores 0 and the
   result is marked incomplete.

A room of 2-4 students: every unique pair is scored once, then
    RoomScore = 0.6 x average of the pair scores + 0.4 x the worst pair score,
so one bad pair pulls the whole room down. Levels: High 80-100, Medium 60-79, Low 0-59.

Everything is deterministic: same answers, same scores; ties are broken by user id.
"""

from __future__ import annotations

from collections.abc import Callable, Iterable, Sequence
from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal
from itertools import combinations

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.survey import ResponseStatus, SurveyAnswer, SurveyCategory, SurveyQuestion, SurveyResponse

# --- Configuration ---------------------------------------------------------------------------

CATEGORY_WEIGHTS: dict[str, float] = {
    "sleep": 0.25,
    "noise": 0.20,
    "cleanliness": 0.20,
    "visitors": 0.20,
    "study": 0.15,
}

# Score for "how many steps apart" two answers on the a-d scale are.
CLOSENESS_BY_STEPS: tuple[int, ...] = (100, 70, 30, 0)

ROOM_AVERAGE_WEIGHT = 0.6
ROOM_WORST_WEIGHT = 0.4

HIGH_FROM = 80
MEDIUM_FROM = 60

MIN_GROUP, MAX_GROUP = 2, 4

# Answers of one student: question code -> chosen option steps (1-4). Single-choice answers have one step.
Answers = dict[str, tuple[int, ...]]


def compatibility_level(score: float) -> str:
    """High 80-100, Medium 60-79, Low 0-59."""
    if score >= HIGH_FROM:
        return "High"
    if score >= MEDIUM_FROM:
        return "Medium"
    return "Low"


def round_score(value: float, digits: int = 0) -> float | int:
    """Half-up rounding (Python's round() rounds 82.5 to 82; people expect 83)."""
    quantum = Decimal(1).scaleb(-digits)
    rounded = Decimal(repr(value)).quantize(quantum, rounding=ROUND_HALF_UP)
    return int(rounded) if digits == 0 else float(rounded)


# --- Scoring rules ---------------------------------------------------------------------------

STEPS = 4  # options a-d


def level(step: int) -> float:
    """Option a..d (step 1..4) as 0.0..1.0."""
    return (step - 1) / (STEPS - 1)


def closeness(a: int, b: int) -> float:
    return float(CLOSENESS_BY_STEPS[min(abs(a - b), len(CLOSENESS_BY_STEPS) - 1)])


def clash(need: float, habit: float) -> float:
    """100 when there is no conflict; falls to 0 when a full need meets a full habit."""
    return 100.0 * (1.0 - max(0.0, need + habit - 1.0))


def two_way_clash(need: Callable[[Answers], float], habit: Callable[[Answers], float], a: Answers, b: Answers) -> float:
    """The worse of "A's need vs B's habit" and "B's need vs A's habit"."""
    return min(clash(need(a), habit(b)), clash(need(b), habit(a)))


def one(answers: Answers, code: str) -> int:
    """The single chosen step for a single-choice question."""
    return answers[code][0]


@dataclass(frozen=True)
class Rule:
    """One scoring rule inside a category."""

    key: str
    label: str
    weight: float  # share inside its category; the weights of one category add up to 1
    codes: tuple[str, ...]  # questions the rule needs from both students
    score: Callable[[Answers, Answers], float]


def _closeness_rule(key: str, label: str, weight: float, code: str) -> Rule:
    return Rule(key, label, weight, (code,), lambda a, b: closeness(one(a, code), one(b, code)))


def _sleep_sensitivity(a: Answers, b: Answers) -> float:
    # A light sleeper (Q3 "very sensitive") suffers more from a different bedtime / wake-up time.
    gap = (abs(one(a, "Q1") - one(b, "Q1")) + abs(one(a, "Q2") - one(b, "Q2"))) / (2 * (STEPS - 1))
    sensitivity = max(1 - level(one(a, "Q3")), 1 - level(one(b, "Q3")))
    return 100.0 * (1.0 - sensitivity * gap)


def _study_schedule(a: Answers, b: Answers) -> float:
    # Q13 (how often you study in the room) matters more when either student says a similar
    # schedule is important (Q15). Even when nobody cares, a difference still counts half.
    base = closeness(one(a, "Q13"), one(b, "Q13"))
    importance = max(1 - level(one(a, "Q15")), 1 - level(one(b, "Q15")))
    return 100.0 - (100.0 - base) * (0.5 + 0.5 * importance)


RULES: dict[str, tuple[Rule, ...]] = {
    "sleep": (
        _closeness_rule("bedtime", "Bedtime", 0.4, "Q1"),
        _closeness_rule("wake_up", "Wake-up time", 0.4, "Q2"),
        Rule("light_sleeper", "Light sleeper vs different schedule", 0.2, ("Q1", "Q2", "Q3"), _sleep_sensitivity),
    ),
    "noise": (
        _closeness_rule("quiet_preference", "How quiet the room should be", 0.35, "Q4"),
        Rule(
            "speakers",
            "Need for quiet vs music on speakers",
            0.35,
            ("Q4", "Q5"),
            lambda a, b: two_way_clash(lambda x: 1 - level(one(x, "Q4")), lambda x: level(one(x, "Q5")), a, b),
        ),
        _closeness_rule("daytime_noise", "Daytime noise comfort", 0.30, "Q6"),
    ),
    "cleanliness": (
        _closeness_rule("importance", "How important cleanliness is", 0.35, "Q7"),
        _closeness_rule("frequency", "How often to clean", 0.35, "Q8"),
        Rule(
            "items_around",
            "Items left around vs tidiness",
            0.30,
            ("Q7", "Q9"),
            lambda a, b: two_way_clash(lambda x: 1 - level(one(x, "Q9")), lambda x: level(one(x, "Q7")), a, b),
        ),
    ),
    "visitors": (
        Rule(
            "visit_frequency",
            "Visitors vs comfort with visitors",
            0.40,
            ("Q10", "Q12"),
            lambda a, b: two_way_clash(lambda x: 1 - level(one(x, "Q12")), lambda x: level(one(x, "Q10")), a, b),
        ),
        _closeness_rule("notice", "Notice before inviting someone", 0.30, "Q11"),
        _closeness_rule("comfort", "Comfort with daytime visitors", 0.30, "Q12"),
    ),
    "study": (
        _closeness_rule("environment", "Study environment", 0.40, "Q14"),
        Rule("schedule", "Studying in the room, and how much it matters", 0.35, ("Q13", "Q15"), _study_schedule),
        Rule(
            "study_vs_speakers",
            "Studying in silence vs music on speakers",
            0.25,
            ("Q13", "Q14", "Q5"),
            lambda a, b: two_way_clash(
                lambda x: (1 - level(one(x, "Q14"))) * (1 - level(one(x, "Q13"))),
                lambda x: level(one(x, "Q5")),
                a,
                b,
            ),
        ),
    ),
}

QUESTION_CODES: tuple[str, ...] = tuple(f"Q{n}" for n in range(1, 16))


# --- Results ---------------------------------------------------------------------------------


@dataclass(frozen=True)
class RuleScore:
    key: str
    label: str
    weight: float
    score: int
    missing: bool


@dataclass(frozen=True)
class CategoryScore:
    category: str
    weight: float
    score: int
    raw: float
    rules: tuple[RuleScore, ...]
    missing_questions: tuple[str, ...]


@dataclass(frozen=True)
class PairResult:
    student_ids: tuple[int, int]
    overall_score: int
    compatibility_level: str
    categories: tuple[CategoryScore, ...]
    missing_questions: tuple[str, ...]

    @property
    def complete(self) -> bool:
        return not self.missing_questions

    def category_scores(self) -> dict[str, int]:
        return {item.category: item.score for item in self.categories}


@dataclass(frozen=True)
class GroupResult:
    member_ids: tuple[int, ...]
    room_score: int
    compatibility_level: str
    average_pairs: float
    worst_pair: int
    worst_pair_ids: tuple[int, int]
    pairs: tuple[PairResult, ...]

    @property
    def complete(self) -> bool:
        return all(pair.complete for pair in self.pairs)


def _answered(answers: Answers, code: str) -> bool:
    return bool(answers.get(code))


def score_category(category: str, a: Answers, b: Answers) -> CategoryScore:
    rules: list[RuleScore] = []
    missing: set[str] = set()
    total = 0.0
    for rule in RULES[category]:
        absent = [code for code in rule.codes if not (_answered(a, code) and _answered(b, code))]
        if absent:
            missing.update(absent)
            value = 0.0  # never assume compatibility for a missing answer
        else:
            value = max(0.0, min(100.0, rule.score(a, b)))
        total += rule.weight * value
        rules.append(RuleScore(rule.key, rule.label, rule.weight, round_score(value), bool(absent)))
    raw = total / sum(rule.weight for rule in RULES[category])
    return CategoryScore(
        category, CATEGORY_WEIGHTS[category], round_score(raw), raw, tuple(rules), tuple(sorted(missing, key=_code_order))
    )


def _code_order(code: str) -> int:
    return int(code[1:]) if code[1:].isdigit() else 999


def score_pair(id_a: int, answers_a: Answers, id_b: int, answers_b: Answers) -> PairResult:
    """Compatibility of two students. Symmetric: score_pair(a, b) == score_pair(b, a)."""
    if id_a > id_b:  # one fixed order, so the result never depends on argument order
        id_a, answers_a, id_b, answers_b = id_b, answers_b, id_a, answers_a
    categories = tuple(score_category(name, answers_a, answers_b) for name in CATEGORY_WEIGHTS)
    overall_raw = sum(item.raw * item.weight for item in categories)
    overall = round_score(overall_raw)
    missing = sorted({code for item in categories for code in item.missing_questions}, key=_code_order)
    return PairResult((id_a, id_b), overall, compatibility_level(overall), categories, tuple(missing))


def room_score(pair_scores: Sequence[int]) -> tuple[int, float, int]:
    """(RoomScore, AveragePairs, WorstPair) for the pair scores of one room."""
    if not pair_scores:
        raise ValueError("A room needs at least one pair.")
    average = sum(pair_scores) / len(pair_scores)
    worst = min(pair_scores)
    return round_score(ROOM_AVERAGE_WEIGHT * average + ROOM_WORST_WEIGHT * worst), round_score(average, 1), worst


def score_group(profiles: dict[int, Answers], member_ids: Iterable[int]) -> GroupResult:
    """Compatibility of a room of 2-4 students. Each unique pair is scored once."""
    members = tuple(sorted(set(member_ids)))
    if not MIN_GROUP <= len(members) <= MAX_GROUP:
        raise ValueError(f"A room has {MIN_GROUP}-{MAX_GROUP} different students.")
    pairs = tuple(score_pair(a, profiles[a], b, profiles[b]) for a, b in combinations(members, 2))
    score, average, worst = room_score([pair.overall_score for pair in pairs])
    worst_pair = min(pairs, key=lambda pair: (pair.overall_score, pair.student_ids))
    return GroupResult(members, score, compatibility_level(score), average, worst, worst_pair.student_ids, pairs)


# --- Building rooms ----------------------------------------------------------------------------


@dataclass
class GroupingResult:
    size: int
    groups: list[GroupResult] = field(default_factory=list)
    unmatched: list[int] = field(default_factory=list)


class _PairTable:
    """Pair scores computed once and looked up afterwards."""

    def __init__(self, profiles: dict[int, Answers]):
        self.profiles = profiles
        self._cache: dict[tuple[int, int], int] = {}

    def score(self, a: int, b: int) -> int:
        key = (a, b) if a < b else (b, a)
        if key not in self._cache:
            self._cache[key] = score_pair(key[0], self.profiles[key[0]], key[1], self.profiles[key[1]]).overall_score
        return self._cache[key]

    def room(self, members: Sequence[int]) -> int:
        return room_score([self.score(a, b) for a, b in combinations(sorted(members), 2)])[0]


def build_groups(profiles: dict[int, Answers], size: int, max_passes: int = 20) -> GroupingResult:
    """Splits students into rooms of `size` (2-4), aiming for high room scores.

    1. Greedy: start each room from the best remaining pair, then add whoever raises the RoomScore most.
    2. Improve: swap students between rooms (and with students left over) while the total of all
       RoomScores goes up. Because RoomScore includes the worst pair, this also removes bad pairs.
    Students left over (when the count does not divide by `size`) are returned as unmatched.
    """
    if not MIN_GROUP <= size <= MAX_GROUP:
        raise ValueError(f"Room size must be {MIN_GROUP}-{MAX_GROUP}.")
    table = _PairTable(profiles)
    pool = sorted(profiles)
    rooms: list[list[int]] = []

    while len(pool) >= size:
        a, b = min(combinations(pool, 2), key=lambda pair: (-table.score(*pair), pair))
        room = [a, b]
        while len(room) < size:
            room.append(min((c for c in pool if c not in room), key=lambda c: (-table.room(room + [c]), c)))
        rooms.append(sorted(room))
        pool = [student for student in pool if student not in room]
    leftovers = pool

    for _ in range(max_passes):
        if not _improve_once(rooms, leftovers, table):
            break

    result = GroupingResult(size=size, unmatched=sorted(leftovers))
    result.groups = sorted(
        (score_group(profiles, room) for room in rooms), key=lambda group: (-group.room_score, group.member_ids)
    )
    return result


def _improve_once(rooms: list[list[int]], leftovers: list[int], table: _PairTable) -> bool:
    """One pass of the best single swap. Returns True if a swap was made."""
    best_gain, best_swap = 0, None
    for i, room_i in enumerate(rooms):
        score_i = table.room(room_i)
        # with another room
        for j in range(i + 1, len(rooms)):
            room_j = rooms[j]
            score_j = table.room(room_j)
            for x in room_i:
                for y in room_j:
                    new_i = [y if s == x else s for s in room_i]
                    new_j = [x if s == y else s for s in room_j]
                    gain = table.room(new_i) + table.room(new_j) - score_i - score_j
                    if gain > best_gain:
                        best_gain, best_swap = gain, ("rooms", i, j, x, y)
        # with a student who has no room
        for x in room_i:
            for y in leftovers:
                gain = table.room([y if s == x else s for s in room_i]) - score_i
                if gain > best_gain:
                    best_gain, best_swap = gain, ("leftover", i, None, x, y)
    if best_swap is None:
        return False
    kind, i, j, x, y = best_swap
    rooms[i] = sorted(y if s == x else s for s in rooms[i])
    if kind == "rooms":
        rooms[j] = sorted(x if s == y else s for s in rooms[j])
    else:
        leftovers[leftovers.index(y)] = x
        leftovers.sort()
    return True


# --- Reading the data --------------------------------------------------------------------------


def load_profiles(db: Session, user_ids: Iterable[int] | None = None, submitted_only: bool = True) -> dict[int, Answers]:
    """Questionnaire answers per student: {user_id: {"Q1": (2,), ...}}."""
    query = select(SurveyResponse).options(
        selectinload(SurveyResponse.answers).selectinload(SurveyAnswer.question),
        selectinload(SurveyResponse.answers).selectinload(SurveyAnswer.options),
    )
    if submitted_only:
        query = query.where(SurveyResponse.status == ResponseStatus.SUBMITTED)
    if user_ids is not None:
        query = query.where(SurveyResponse.user_id.in_(list(user_ids)))
    profiles: dict[int, Answers] = {}
    for response in db.scalars(query):
        profiles[response.user_id] = {
            answer.question.code: tuple(sorted(option.value for option in answer.options))
            for answer in response.answers
            if answer.options
        }
    return profiles


@dataclass(frozen=True)
class QuestionInfo:
    code: str
    category: str
    text: str
    options: dict[int, str]  # step -> label


def load_questionnaire(db: Session) -> list[QuestionInfo]:
    """Questions in questionnaire order, with their option labels (for showing answers side by side)."""
    categories = db.scalars(
        select(SurveyCategory)
        .order_by(SurveyCategory.position)
        .options(selectinload(SurveyCategory.questions).selectinload(SurveyQuestion.options))
    )
    return [
        QuestionInfo(question.code, category.id, question.text, {option.value: option.label for option in question.options})
        for category in categories
        for question in sorted(category.questions, key=lambda q: q.position)
    ]


def compare_answers(questions: list[QuestionInfo], a: Answers, b: Answers) -> list[dict]:
    """Both students' answers per question, with how many steps apart they are (None if one is missing)."""
    rows = []
    for question in questions:
        steps_a, steps_b = a.get(question.code, ()), b.get(question.code, ())
        rows.append(
            {
                "code": question.code,
                "category": question.category,
                "question": question.text,
                "answer_1": ", ".join(question.options.get(step, "?") for step in steps_a) or None,
                "answer_2": ", ".join(question.options.get(step, "?") for step in steps_b) or None,
                "steps_apart": abs(steps_a[0] - steps_b[0]) if len(steps_a) == 1 and len(steps_b) == 1 else None,
            }
        )
    return rows
