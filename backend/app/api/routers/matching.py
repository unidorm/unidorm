"""Phase 3 endpoints. The matching algorithm itself lives in app/services/matching_service.py."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_manager, require_student
from app.db.session import get_db
from app.models.user import User
from app.schemas.matching import (
    CompareIn,
    GroupDetailOut,
    MatchingOverviewOut,
    RoommateGroupDetailOut,
    RoommateGroupOut,
    StudentMatchingOut,
)
from app.services import room_groups

# Housing Office: every endpoint needs a housing manager.
router = APIRouter(prefix="/api/matching", tags=["matching"], dependencies=[Depends(require_manager)])


@router.get("/overview", response_model=MatchingOverviewOut)
def overview(db: Session = Depends(get_db)) -> MatchingOverviewOut:
    """Students who can be matched, open proposals and approved rooms."""
    return room_groups.overview(db)


@router.post("/runs", response_model=MatchingOverviewOut, status_code=201)
def run(manager: User = Depends(require_manager), db: Session = Depends(get_db)) -> MatchingOverviewOut:
    """Calculates compatibility and proposes room groups. Nothing is final until a manager approves."""
    return room_groups.run_matching(db, manager)


@router.post("/compare", response_model=GroupDetailOut)
def compare(data: CompareIn, db: Session = Depends(get_db)) -> GroupDetailOut:
    """Compatibility of 2-4 chosen students, with every pair in detail."""
    return room_groups.compare(db, data.user_ids)


@router.get("/groups/{group_id}", response_model=RoommateGroupDetailOut)
def group_detail(group_id: int, db: Session = Depends(get_db)) -> RoommateGroupDetailOut:
    return room_groups.group_detail(db, group_id)


@router.post("/groups/{group_id}/approve", response_model=RoommateGroupOut)
def approve(group_id: int, manager: User = Depends(require_manager), db: Session = Depends(get_db)) -> RoommateGroupOut:
    return room_groups.decide(db, group_id, manager, approve=True)


@router.post("/groups/{group_id}/reject", response_model=RoommateGroupOut)
def reject(group_id: int, manager: User = Depends(require_manager), db: Session = Depends(get_db)) -> RoommateGroupOut:
    return room_groups.decide(db, group_id, manager, approve=False)


# Student side: only the signed-in student's own approved room.
student_router = APIRouter(prefix="/api/student", tags=["student"])


@student_router.get("/matching", response_model=StudentMatchingOut)
def my_matching(user: User = Depends(require_student), db: Session = Depends(get_db)) -> StudentMatchingOut:
    return room_groups.for_student(db, user)
