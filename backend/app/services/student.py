from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.survey import ResponseStatus
from app.models.user import RoomType, User
from app.schemas.auth import UserOut
from app.schemas.student import DashboardOut, RoomPreferenceOut, SurveySummary
from app.services import survey as survey_service


def _is_locked(db: Session, user: User) -> bool:
    response = survey_service.get_response(db, user)
    return response is not None and response.status == ResponseStatus.SUBMITTED


def room_preference_out(db: Session, user: User) -> RoomPreferenceOut:
    return RoomPreferenceOut(
        room_type=user.room_preference,
        updated_at=user.room_preference_updated_at,
        can_change=not _is_locked(db, user),
    )


def set_room_preference(db: Session, user: User, room_type: RoomType) -> RoomPreferenceOut:
    if _is_locked(db, user):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail="Your survey is submitted, so the room type is fixed. Contact the Housing Office to change it.",
        )
    user.room_preference = room_type
    user.room_preference_updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(user)
    return room_preference_out(db, user)


def dashboard(db: Session, user: User) -> DashboardOut:
    response = survey_service.response_out(db, survey_service.get_response(db, user))
    if response.status == ResponseStatus.SUBMITTED:
        state = "submitted"
    elif user.room_preference == RoomType.SINGLE:
        state = "not_needed"
    elif response.answered > 0:
        state = "in_progress"
    else:
        state = "not_started"
    return DashboardOut(
        user=UserOut.model_validate(user),
        room_preference=room_preference_out(db, user),
        survey=SurveySummary(
            state=state, answered=response.answered, total=response.total, submitted_at=response.submitted_at
        ),
    )
