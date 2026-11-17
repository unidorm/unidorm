from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_student
from app.db.session import get_db
from app.models.user import User
from app.schemas.student import DashboardOut, RoomPreferenceIn, RoomPreferenceOut
from app.services import student as student_service

# Every endpoint works on the signed-in student only: there is no user id in any path.
router = APIRouter(prefix="/api/student", tags=["student"])


@router.get("/dashboard", response_model=DashboardOut)
def dashboard(user: User = Depends(require_student), db: Session = Depends(get_db)) -> DashboardOut:
    return student_service.dashboard(db, user)


@router.get("/room-preference", response_model=RoomPreferenceOut)
def get_room_preference(user: User = Depends(require_student), db: Session = Depends(get_db)) -> RoomPreferenceOut:
    return student_service.room_preference_out(db, user)


@router.put("/room-preference", response_model=RoomPreferenceOut)
def put_room_preference(
    data: RoomPreferenceIn, user: User = Depends(require_student), db: Session = Depends(get_db)
) -> RoomPreferenceOut:
    return student_service.set_room_preference(db, user, data.room_type)
