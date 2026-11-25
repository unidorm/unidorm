"""Unit tests for the matching algorithm (no database needed)."""

import pytest

from app.services.matching_service import (
    CATEGORY_WEIGHTS,
    RULES,
    build_groups,
    compatibility_level,
    round_score,
    score_group,
    score_pair,
)

LETTERS = "abcd"


def profile(letters: str) -> dict[str, tuple[int, ...]]:
    """15 letters a-d -> answers for Q1..Q15 ('-' = not answered)."""
    assert len(letters) == 15
    return {f"Q{i}": (LETTERS.index(ch) + 1,) for i, ch in enumerate(letters, start=1) if ch != "-"}


def with_answer(letters: str, question: int, letter: str) -> str:
    return letters[: question - 1] + letter + letters[question:]


ALL_B = "b" * 15
QUIET = "abaaaaaababbaaa"   # early bird, needs quiet, very tidy, few visitors, studies in silence
QUIET_2 = "bbaaabaabbbbaab"  # similar person, a step off here and there
PARTY = "ddddddddddddddc"   # late, loud, relaxed about mess, lots of visitors


# --- configuration ---------------------------------------------------------------------------


def test_weights_add_up():
    assert CATEGORY_WEIGHTS == {"sleep": 0.25, "noise": 0.20, "cleanliness": 0.20, "visitors": 0.20, "study": 0.15}
    assert sum(CATEGORY_WEIGHTS.values()) == pytest.approx(1.0)
    for rules in RULES.values():
        assert sum(rule.weight for rule in rules) == pytest.approx(1.0)


def test_every_question_is_used():
    used = {code for rules in RULES.values() for rule in rules for code in rule.codes}
    assert used == {f"Q{n}" for n in range(1, 16)}


@pytest.mark.parametrize(
    ("score", "level"),
    [(100, "High"), (80, "High"), (79, "Medium"), (79.9, "Medium"), (60, "Medium"), (59, "Low"), (0, "Low")],
)
def test_levels(score, level):
    assert compatibility_level(score) == level


def test_rounding_is_half_up():
    assert round_score(82.5) == 83
    assert round_score(82.49) == 82
    assert round_score(81.25, 1) == 81.3


# --- pairs -------------------------------------------------------------------------------------


def test_identical_answers_score_100():
    result = score_pair(1, profile(ALL_B), 2, profile(ALL_B))
    assert result.overall_score == 100
    assert result.compatibility_level == "High"
    assert set(result.category_scores().values()) == {100}
    assert result.complete


def test_identical_consistent_profiles_score_100():
    for letters in (QUIET, PARTY):
        assert score_pair(1, profile(letters), 2, profile(letters)).overall_score == 100


def test_identical_answers_can_still_clash():
    # Both want complete quiet but both play music on speakers: the algorithm reads meaning, not equality.
    letters = with_answer(ALL_B, 4, "a")
    letters = with_answer(letters, 5, "d")
    result = score_pair(1, profile(letters), 2, profile(letters))
    assert result.category_scores()["noise"] < 100


def test_one_step_difference_is_scored_by_hand():
    # Only Q1 (bedtime) differs by one step: b vs c. Everything else is identical.
    result = score_pair(1, profile(ALL_B), 2, profile(with_answer(ALL_B, 1, "c")))
    # Sleep = 0.4 x bedtime 70 + 0.4 x wake-up 100 + 0.2 x light-sleeper rule.
    # Light-sleeper rule: gap = 1/6, sensitivity of "b" = 2/3 -> 100 x (1 - 1/9) = 88.9.
    sleep = 0.4 * 70 + 0.4 * 100 + 0.2 * (100 * (1 - (2 / 3) * (1 / 6)))
    assert result.category_scores() == {"sleep": round(sleep), "noise": 100, "cleanliness": 100, "visitors": 100, "study": 100}
    # Overall = 0.25 x sleep + (0.20 + 0.20 + 0.20 + 0.15) x 100
    assert result.overall_score == round_score(0.25 * sleep + 0.75 * 100)
    assert result.overall_score == 96


def test_overall_uses_the_weights():
    result = score_pair(1, profile(QUIET), 2, profile(PARTY))
    expected = sum(item.raw * CATEGORY_WEIGHTS[item.category] for item in result.categories)
    assert result.overall_score == round_score(expected)
    assert 0 <= result.overall_score <= 100


def test_similar_habits_score_high():
    result = score_pair(1, profile(QUIET), 2, profile(QUIET_2))
    assert result.compatibility_level == "High"
    assert 80 <= result.overall_score < 100


def test_opposite_habits_score_low():
    result = score_pair(1, profile("a" * 15), 2, profile("d" * 15))
    assert result.overall_score == 0
    assert result.compatibility_level == "Low"
    assert score_pair(1, profile(QUIET), 2, profile(PARTY)).compatibility_level == "Low"


def test_bigger_differences_cost_more():
    base = profile(ALL_B)
    scores = [score_pair(1, base, 2, profile(with_answer(ALL_B, 14, letter))).category_scores()["study"] for letter in "bcd"]
    assert scores[0] > scores[1] > scores[2]
    # a second step apart costs more than the first one
    assert (scores[0] - scores[1]) > (100 - scores[0])


def test_speakers_clash_with_need_for_quiet():
    needs_quiet = with_answer(ALL_B, 4, "a")  # completely quiet
    speakers = with_answer(ALL_B, 5, "d")  # usually speakers
    headphones = with_answer(ALL_B, 5, "a")
    assert (
        score_pair(1, profile(needs_quiet), 2, profile(speakers)).category_scores()["noise"]
        < score_pair(1, profile(needs_quiet), 2, profile(headphones)).category_scores()["noise"]
    )


def test_pairs_are_symmetric_and_deterministic():
    a, b = profile(QUIET), profile(PARTY)
    first = score_pair(7, a, 3, b)
    assert first == score_pair(3, b, 7, a) == score_pair(7, a, 3, b)
    assert first.student_ids == (3, 7)


def test_missing_answers_are_not_compatible():
    full = score_pair(1, profile(ALL_B), 2, profile(ALL_B))
    partial = score_pair(1, profile(ALL_B), 2, profile("-" + ALL_B[1:]))
    assert not partial.complete
    assert partial.missing_questions == ("Q1",)
    assert partial.category_scores()["sleep"] < full.category_scores()["sleep"]
    assert partial.overall_score < full.overall_score
    sleep_rules = {rule.key: rule for rule in partial.categories[0].rules}
    assert sleep_rules["bedtime"].missing and sleep_rules["bedtime"].score == 0


def test_empty_questionnaire_scores_zero():
    result = score_pair(1, profile(ALL_B), 2, {})
    assert result.overall_score == 0
    assert len(result.missing_questions) == 15


# --- groups ------------------------------------------------------------------------------------


def test_group_of_two_equals_the_pair():
    profiles = {1: profile(QUIET), 2: profile(QUIET_2)}
    group = score_group(profiles, [2, 1])
    pair = score_pair(1, profiles[1], 2, profiles[2])
    assert len(group.pairs) == 1
    assert group.room_score == group.worst_pair == pair.overall_score
    assert group.average_pairs == pair.overall_score


def test_group_of_three_uses_every_pair_once():
    profiles = {1: profile(QUIET), 2: profile(QUIET_2), 3: profile(ALL_B)}
    group = score_group(profiles, [3, 1, 2])
    assert [pair.student_ids for pair in group.pairs] == [(1, 2), (1, 3), (2, 3)]
    scores = [pair.overall_score for pair in group.pairs]
    average = sum(scores) / 3
    assert group.worst_pair == min(scores)
    assert group.average_pairs == round_score(average, 1)
    assert group.room_score == round_score(0.6 * average + 0.4 * min(scores))


def test_group_of_four_has_six_pairs():
    profiles = {n: profile(ALL_B) for n in (1, 2, 3, 4)}
    group = score_group(profiles, [1, 2, 3, 4])
    assert len(group.pairs) == 6
    assert group.room_score == 100
    assert group.compatibility_level == "High"


def test_one_bad_pair_pulls_the_room_down():
    profiles = {1: profile(QUIET), 2: profile(QUIET_2), 3: profile(QUIET), 4: profile(PARTY)}
    good = score_group(profiles, [1, 2, 3])
    bad = score_group(profiles, [1, 2, 4])
    assert good.compatibility_level == "High"
    assert bad.room_score < bad.average_pairs  # the worst pair counts extra
    assert bad.worst_pair_ids in {(1, 4), (2, 4)}
    assert bad.compatibility_level == "Low"


@pytest.mark.parametrize("members", [[1], [1, 1], [1, 2, 3, 4, 5]])
def test_invalid_group_sizes(members):
    profiles = {n: profile(ALL_B) for n in range(1, 6)}
    with pytest.raises(ValueError):
        score_group(profiles, members)


# --- building rooms ----------------------------------------------------------------------------


def test_build_pairs_puts_similar_students_together():
    profiles = {1: profile(QUIET), 2: profile(PARTY), 3: profile(QUIET_2), 4: profile(with_answer(PARTY, 1, "c"))}
    result = build_groups(profiles, 2)
    assert sorted(group.member_ids for group in result.groups) == [(1, 3), (2, 4)]
    assert result.unmatched == []
    assert all(group.compatibility_level == "High" for group in result.groups)


def test_build_rooms_of_three_with_leftover():
    profiles = {n: profile(QUIET if n % 2 else PARTY) for n in range(1, 8)}  # 4 quiet, 3 party
    result = build_groups(profiles, 3)
    assert len(result.groups) == 2 and len(result.unmatched) == 1
    rooms = [set(group.member_ids) for group in result.groups]
    assert {2, 4, 6} in rooms  # the three party students together
    assert result.unmatched[0] % 2 == 1  # the student left over is a quiet one
    assert build_groups(profiles, 3).groups == result.groups  # deterministic


def test_build_rooms_of_four_improves_on_a_bad_split():
    profiles = {n: profile(QUIET if n <= 4 else PARTY) for n in range(1, 9)}
    result = build_groups(profiles, 4)
    assert sorted(group.member_ids for group in result.groups) == [(1, 2, 3, 4), (5, 6, 7, 8)]
    assert all(group.room_score == 100 for group in result.groups)


def test_build_rejects_bad_sizes():
    with pytest.raises(ValueError):
        build_groups({1: profile(ALL_B)}, 5)
