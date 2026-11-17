"""Questionnaire logic: structure, a student's answers, saving and submitting."""

from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.survey import (
    AnswerType,
    ResponseStatus,
    SurveyAnswer,
    SurveyCategory,
    SurveyOption,
    SurveyQuestion,
    SurveyResponse,
)
from app.models.user import RoomType, User
from app.schemas.survey import CategoryOut, ResponseOut, SaveAnswersIn, SurveyStructure


class UnansweredQuestionsError(Exception):
    """Raised on submit when required questions are still empty (turned into a 422 response)."""

    def __init__(self, question_ids: list[int]):
        self.question_ids = question_ids
        super().__init__("Answer all questions before submitting.")


def get_structure(db: Session) -> SurveyStructure:
    categories = db.scalars(
        select(SurveyCategory)
        .options(selectinload(SurveyCategory.questions).selectinload(SurveyQuestion.options))
        .order_by(SurveyCategory.position)
    ).all()
    out = [CategoryOut.model_validate(c) for c in categories]
    return SurveyStructure(categories=out, total_questions=sum(len(c.questions) for c in out))


def count_questions(db: Session) -> int:
    return db.scalar(select(func.count()).select_from(SurveyQuestion)) or 0


def get_response(db: Session, user: User) -> SurveyResponse | None:
    return db.scalar(
        select(SurveyResponse)
        .where(SurveyResponse.user_id == user.id)
        .options(selectinload(SurveyResponse.answers).selectinload(SurveyAnswer.options))
    )


def response_out(db: Session, response: SurveyResponse | None) -> ResponseOut:
    total = count_questions(db)
    if response is None:
        return ResponseOut(status=None, answers={}, answered=0, total=total, updated_at=None, submitted_at=None)
    answers = {a.question_id: sorted(o.id for o in a.options) for a in response.answers if a.options}
    return ResponseOut(
        status=response.status,
        answers=answers,
        answered=len(answers),
        total=total,
        updated_at=response.updated_at,
        submitted_at=response.submitted_at,
    )


def _ensure_shared_room(user: User) -> None:
    if user.room_preference is None:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Choose a room type before the survey.")
    if user.room_preference == RoomType.SINGLE:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="The survey is only needed for shared rooms.")


def _ensure_editable(response: SurveyResponse) -> None:
    if response.status == ResponseStatus.SUBMITTED:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="The survey is already submitted and cannot be changed.")


def save_answers(db: Session, user: User, data: SaveAnswersIn) -> ResponseOut:
    """Saves (creates, replaces or clears) answers. Only the student's own draft can change."""
    _ensure_shared_room(user)
    response = get_response(db, user)
    if response is None:
        response = SurveyResponse(user_id=user.id, status=ResponseStatus.DRAFT)
        db.add(response)
        db.flush()
    _ensure_editable(response)

    question_ids = {a.question_id for a in data.answers}
    if len(question_ids) != len(data.answers):
        raise HTTPException(422, detail="Each question can appear only once.")
    questions = {
        q.id: q
        for q in db.scalars(
            select(SurveyQuestion).where(SurveyQuestion.id.in_(question_ids)).options(selectinload(SurveyQuestion.options))
        )
    }
    by_question = {a.question_id: a for a in response.answers}

    for item in data.answers:
        question = questions.get(item.question_id)
        if question is None:
            raise HTTPException(422, detail=f"Unknown question {item.question_id}.")
        chosen = set(item.option_ids)
        valid = {o.id: o for o in question.options}
        if not chosen <= valid.keys():
            raise HTTPException(
                422, detail=f"An answer to {question.code} is not one of its options."
            )
        if question.answer_type == AnswerType.SINGLE_CHOICE and len(chosen) > 1:
            raise HTTPException(422, detail=f"{question.code} takes one answer.")

        answer = by_question.get(question.id)
        if not chosen:
            if answer is not None:
                response.answers.remove(answer)
            continue
        if answer is None:
            answer = SurveyAnswer(question_id=question.id)
            response.answers.append(answer)
        answer.options = [valid[option_id] for option_id in sorted(chosen)]

    response.updated_at = datetime.now(UTC)
    db.commit()
    return response_out(db, get_response(db, user))


def submit(db: Session, user: User) -> ResponseOut:
    _ensure_shared_room(user)
    response = get_response(db, user)
    if response is None:
        raise UnansweredQuestionsError([q.id for q in db.scalars(select(SurveyQuestion).order_by(SurveyQuestion.id))])
    _ensure_editable(response)

    answered = {a.question_id for a in response.answers if a.options}
    required = db.scalars(
        select(SurveyQuestion.id).where(SurveyQuestion.is_required.is_(True)).order_by(SurveyQuestion.id)
    ).all()
    missing = [qid for qid in required if qid not in answered]
    if missing:
        raise UnansweredQuestionsError(missing)

    response.status = ResponseStatus.SUBMITTED
    response.submitted_at = datetime.now(UTC)
    db.commit()
    return response_out(db, get_response(db, user))
