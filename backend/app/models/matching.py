"""Phase 3: results of the matching process and the manager's decisions.

A MatchingRun is one press of "Run matching" by a housing manager. It proposes RoommateGroups;
a group only becomes final when a manager approves it. The scores are a snapshot from the run
(answers are locked after submission, so they do not go stale); the details are recalculated
from the answers by app/services/matching_service.py whenever they are shown.
"""

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.user import ROOM_TYPE_ENUM, RoomType

if TYPE_CHECKING:
    from app.models.user import User


class GroupStatus(str, enum.Enum):
    PROPOSED = "proposed"  # suggested by the algorithm, waiting for the manager
    APPROVED = "approved"  # confirmed by a manager: these students will share a room
    REJECTED = "rejected"  # turned down; the students can be matched again in the next run


class MatchingRun(Base):
    __tablename__ = "matching_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    started_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    eligible_count: Mapped[int] = mapped_column(Integer)

    started_by: Mapped["User | None"] = relationship()
    groups: Mapped[list["RoommateGroup"]] = relationship(back_populates="run", order_by="RoommateGroup.id")


class RoommateGroup(Base):
    __tablename__ = "roommate_groups"

    id: Mapped[int] = mapped_column(primary_key=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("matching_runs.id", ondelete="CASCADE"), index=True)
    room_type: Mapped[RoomType] = mapped_column(ROOM_TYPE_ENUM)
    status: Mapped[GroupStatus] = mapped_column(
        Enum(GroupStatus, name="roommate_group_status", values_callable=lambda e: [m.value for m in e]),
        default=GroupStatus.PROPOSED,
        index=True,
    )
    room_score: Mapped[int] = mapped_column(Integer)
    average_pairs: Mapped[float] = mapped_column(Float)
    worst_pair: Mapped[int] = mapped_column(Integer)
    compatibility_level: Mapped[str] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    decided_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    run: Mapped[MatchingRun] = relationship(back_populates="groups")
    members: Mapped[list["RoommateGroupMember"]] = relationship(
        back_populates="group", cascade="all, delete-orphan", order_by="RoommateGroupMember.user_id"
    )
    decided_by: Mapped["User | None"] = relationship(foreign_keys=[decided_by_id])


class RoommateGroupMember(Base):
    __tablename__ = "roommate_group_members"

    group_id: Mapped[int] = mapped_column(ForeignKey("roommate_groups.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True)

    group: Mapped[RoommateGroup] = relationship(back_populates="members")
    user: Mapped["User"] = relationship()
