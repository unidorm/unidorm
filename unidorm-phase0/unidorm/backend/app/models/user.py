import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserRole(str, enum.Enum):
    """The two kinds of users in UniDorm."""

    STUDENT = "student"
    HOUSING_MANAGER = "housing_manager"


class User(Base):
    """A UniDorm user. Authentication fields are added in the authentication stage."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    role: Mapped[UserRole] = mapped_column(
        # Store the lowercase values ("student", "housing_manager") in the database enum.
        Enum(UserRole, name="user_role", values_callable=lambda roles: [role.value for role in roles])
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, email={self.email!r}, role={self.role!r})"
