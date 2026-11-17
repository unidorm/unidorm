"""Habits questionnaire: its structure (categories, questions, options) and students' answers.

The structure lives in the database, so questions and categories can be added, removed or
reworded without changing the frontend Survey component.
"""

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


def _enum_values(enum_class: type[enum.Enum]) -> list[str]:
    return [member.value for member in enum_class]


class AnswerType(str, enum.Enum):
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"


class ResponseStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"


class SurveyCategory(Base):
    __tablename__ = "survey_categories"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)  # "sleep", "noise", ...
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text, default="")
    weight: Mapped[int] = mapped_column(Integer)  # share of the compatibility score, in percent
    position: Mapped[int] = mapped_column(Integer)

    questions: Mapped[list["SurveyQuestion"]] = relationship(
        back_populates="category", order_by="SurveyQuestion.position", cascade="all, delete-orphan"
    )


class SurveyQuestion(Base):
    __tablename__ = "survey_questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(10), unique=True)  # "Q1" ... "Q15"
    category_id: Mapped[str] = mapped_column(ForeignKey("survey_categories.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    answer_type: Mapped[AnswerType] = mapped_column(
        Enum(AnswerType, name="survey_answer_type", values_callable=_enum_values),
        default=AnswerType.SINGLE_CHOICE,
    )
    is_required: Mapped[bool] = mapped_column(Boolean, default=True)

    category: Mapped[SurveyCategory] = relationship(back_populates="questions")
    options: Mapped[list["SurveyOption"]] = relationship(
        back_populates="question", order_by="SurveyOption.position", cascade="all, delete-orphan"
    )


class SurveyOption(Base):
    __tablename__ = "survey_options"
    __table_args__ = (UniqueConstraint("question_id", "position"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("survey_questions.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    label: Mapped[str] = mapped_column(String(200))
    # Position on the a-d scale (1-4). The scoring stage compares these values.
    value: Mapped[int] = mapped_column(Integer)

    question: Mapped[SurveyQuestion] = relationship(back_populates="options")


survey_answer_options = Table(
    "survey_answer_options",
    Base.metadata,
    Column("answer_id", ForeignKey("survey_answers.id", ondelete="CASCADE"), primary_key=True),
    Column("option_id", ForeignKey("survey_options.id", ondelete="CASCADE"), primary_key=True),
)


class SurveyResponse(Base):
    """One questionnaire per student: a draft while answering, then submitted (locked)."""

    __tablename__ = "survey_responses"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    status: Mapped[ResponseStatus] = mapped_column(
        Enum(ResponseStatus, name="survey_response_status", values_callable=_enum_values),
        default=ResponseStatus.DRAFT,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="survey_response")
    answers: Mapped[list["SurveyAnswer"]] = relationship(back_populates="response", cascade="all, delete-orphan")


class SurveyAnswer(Base):
    __tablename__ = "survey_answers"
    __table_args__ = (UniqueConstraint("response_id", "question_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    response_id: Mapped[int] = mapped_column(ForeignKey("survey_responses.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("survey_questions.id", ondelete="CASCADE"))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    response: Mapped[SurveyResponse] = relationship(back_populates="answers")
    question: Mapped[SurveyQuestion] = relationship()
    options: Mapped[list[SurveyOption]] = relationship(secondary=survey_answer_options)
