from fastapi import APIRouter

from app.schemas.portal import Announcement, Audience, KeyDate
from app.services import portal as portal_service

router = APIRouter(prefix="/api/portal", tags=["portal"])


@router.get("/announcements", response_model=list[Announcement])
def announcements(audience: Audience | None = None) -> list[Announcement]:
    """Notices for the portal home page. `audience` filters to student or housing_manager."""
    return portal_service.list_announcements(audience)


@router.get("/key-dates", response_model=list[KeyDate])
def key_dates() -> list[KeyDate]:
    """The yearly accommodation timeline."""
    return portal_service.list_key_dates()
