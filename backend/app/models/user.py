import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.auth_session import AuthSession
    from app.models.survey import SurveyResponse


class UserRole(str, enum.Enum):
    """The two kinds of users in UniDorm."""

    STUDENT = "student"
    HOUSING_MANAGER = "housing_manager"


class RoomType(str, enum.Enum):
    """Room types a student can ask for in Jastar City."""

    SINGLE = "single"
    DOUBLE = "double"
    TRIPLE = "triple"
    QUAD = "quad"

    @property
    def capacity(self) -> int:
        return {"single": 1, "double": 2, "triple": 3, "quad": 4}[self.value]


def _enum_values(enum_class: type[enum.Enum]) -> list[str]:
    # Store the lowercase values ("student", "double", ...) in the database enums.
    return [member.value for member in enum_class]


ROOM_TYPE_ENUM = Enum(RoomType, name="room_type", values_callable=_enum_values)


class User(Base):
    """A UniDorm user (student or housing manager)."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role", values_callable=_enum_values))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Phase 2. Nullable, because users created in Stage 1 have no password or preference yet.
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    room_preference: Mapped[RoomType | None] = mapped_column(ROOM_TYPE_ENUM, nullable=True)
    room_preference_updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    sessions: Mapped[list["AuthSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    survey_response: Mapped["SurveyResponse | None"] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, email={self.email!r}, role={self.role!r})"
