from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.models.user import RoomType
from app.schemas.auth import UserOut


class RoomPreferenceIn(BaseModel):
    room_type: RoomType


class RoomPreferenceOut(BaseModel):
    room_type: RoomType | None
    updated_at: datetime | None
    # False once the questionnaire is submitted: the room type is then fixed for this year.
    can_change: bool


SurveyState = Literal["not_needed", "not_started", "in_progress", "submitted"]


class SurveySummary(BaseModel):
    state: SurveyState
    answered: int
    total: int
    submitted_at: datetime | None


class DashboardOut(BaseModel):
    user: UserOut
    room_preference: RoomPreferenceOut
    survey: SurveySummary
