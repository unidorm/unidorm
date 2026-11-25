# Import every model here so that Base.metadata knows about all tables.
from app.models.auth_session import AuthSession
from app.models.matching import GroupStatus, MatchingRun, RoommateGroup, RoommateGroupMember
from app.models.survey import (
    AnswerType,
    ResponseStatus,
    SurveyAnswer,
    SurveyCategory,
    SurveyOption,
    SurveyQuestion,
    SurveyResponse,
)
from app.models.user import RoomType, User, UserRole

__all__ = [
    "AnswerType",
    "AuthSession",
    "GroupStatus",
    "MatchingRun",
    "RoommateGroup",
    "RoommateGroupMember",
    "ResponseStatus",
    "RoomType",
    "SurveyAnswer",
    "SurveyCategory",
    "SurveyOption",
    "SurveyQuestion",
    "SurveyResponse",
    "User",
    "UserRole",
]
