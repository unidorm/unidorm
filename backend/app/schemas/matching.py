"""Response shapes for Phase 3 (matching). All scores are calculated by the backend."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.models.matching import GroupStatus
from app.models.user import RoomType

Level = Literal["High", "Medium", "Low"]


class StudentRef(BaseModel):
    id: int
    full_name: str


class RuleScoreOut(BaseModel):
    key: str
    label: str
    weight: float  # share inside the category (0-1)
    score: int
    missing: bool


class CategoryScoreOut(BaseModel):
    category: str  # "sleep", "noise", ...
    title: str
    weight: int  # percent of the overall score
    score: int  # 0-100
    rules: list[RuleScoreOut]
    missing_questions: list[str]


class AnswerRow(BaseModel):
    code: str
    category: str
    question: str
    answer_1: str | None  # student_1's answer
    answer_2: str | None
    steps_apart: int | None  # 0 = same answer, 3 = opposite ends; None when an answer is missing


class PairOut(BaseModel):
    student_1: StudentRef
    student_2: StudentRef
    overall_score: int
    compatibility_level: Level
    category_scores: dict[str, int]
    categories: list[CategoryScoreOut]
    complete: bool
    missing_questions: list[str]
    answers: list[AnswerRow] | None = None


class PairScoreOut(BaseModel):
    student_1: StudentRef
    student_2: StudentRef
    overall_score: int
    compatibility_level: Level


class GroupOut(BaseModel):
    members: list[StudentRef]
    room_score: int
    compatibility_level: Level
    average_pairs: float
    worst_pair: int
    worst_pair_students: list[StudentRef]
    pair_scores: list[PairScoreOut]
    complete: bool


class CompareIn(BaseModel):
    user_ids: list[int] = Field(min_length=2, max_length=4)

    @field_validator("user_ids")
    @classmethod
    def different_students(cls, value: list[int]) -> list[int]:
        if len(set(value)) != len(value):
            raise ValueError("Choose different students.")
        return value


class GroupDetailOut(GroupOut):
    pairs: list[PairOut]  # every pair in full, with both students' answers


class RoommateGroupOut(BaseModel):
    id: int
    run_id: int
    room_type: RoomType
    status: GroupStatus
    created_at: datetime
    decided_at: datetime | None
    decided_by: str | None
    result: GroupOut


class RoommateGroupDetailOut(GroupDetailOut):
    id: int
    run_id: int
    room_type: RoomType
    status: GroupStatus
    created_at: datetime
    decided_at: datetime | None
    decided_by: str | None


class EligibleStudentOut(BaseModel):
    id: int
    full_name: str
    email: str
    room_type: RoomType
    submitted_at: datetime | None
    # "waiting" = not in a group yet (or the last proposal was rejected)
    match_status: Literal["waiting", "proposed", "approved"]
    group_id: int | None


class RunSummary(BaseModel):
    id: int
    created_at: datetime
    started_by: str | None
    eligible_count: int
    proposed_count: int


class MatchingOverviewOut(BaseModel):
    students: list[EligibleStudentOut]
    proposed: list[RoommateGroupOut]
    approved: list[RoommateGroupOut]
    last_run: RunSummary | None
    # Shared-room students who have not submitted the questionnaire yet (not matched until they do).
    waiting_for_questionnaire: int


class StudentMatchingOut(BaseModel):
    # not_needed: single room. no_questionnaire: not submitted yet. waiting: submitted, no approved room yet.
    state: Literal["not_needed", "no_questionnaire", "waiting", "matched"]
    room_type: RoomType | None
    approved_at: datetime | None = None
    group: GroupOut | None = None
    # The student compared with each roommate (the student is always student_1).
    pairs: list[PairOut] = []
