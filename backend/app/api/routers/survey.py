from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_student
from app.db.session import get_db
from app.models.user import User
from app.schemas.survey import ResponseOut, SaveAnswersIn, SurveyStructure
from app.services import survey as survey_service

router = APIRouter(prefix="/api/survey", tags=["survey"])


@router.get("", response_model=SurveyStructure)
def structure(_: User = Depends(require_student), db: Session = Depends(get_db)) -> SurveyStructure:
    """Categories, questions and answer options, in display order."""
    return survey_service.get_structure(db)


@router.get("/response", response_model=ResponseOut)
def my_response(user: User = Depends(require_student), db: Session = Depends(get_db)) -> ResponseOut:
    """The signed-in student's saved answers."""
    return survey_service.response_out(db, survey_service.get_response(db, user))


@router.put("/response/answers", response_model=ResponseOut)
def save_answers(
    data: SaveAnswersIn, user: User = Depends(require_student), db: Session = Depends(get_db)
) -> ResponseOut:
    """Saves some answers (for example one category). An empty option list clears that answer."""
    return survey_service.save_answers(db, user, data)


@router.post("/response/submit", response_model=ResponseOut)
def submit(user: User = Depends(require_student), db: Session = Depends(get_db)) -> ResponseOut:
    """Checks that every required question is answered, then locks the questionnaire."""
    return survey_service.submit(db, user)
