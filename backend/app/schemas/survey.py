from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.survey import AnswerType, ResponseStatus


class OptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    value: int


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    text: str
    answer_type: AnswerType
    is_required: bool
    options: list[OptionOut]


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    weight: int
    questions: list[QuestionOut]


class SurveyStructure(BaseModel):
    categories: list[CategoryOut]
    total_questions: int


class AnswerIn(BaseModel):
    question_id: int
    # Empty list = clear the answer to this question.
    option_ids: list[int] = Field(default_factory=list, max_length=20)


class SaveAnswersIn(BaseModel):
    answers: list[AnswerIn] = Field(min_length=1, max_length=100)


class ResponseOut(BaseModel):
    status: ResponseStatus | None  # None = the student has not started yet
    answers: dict[int, list[int]]  # question id -> chosen option ids
    answered: int
    total: int
    updated_at: datetime | None
    submitted_at: datetime | None
