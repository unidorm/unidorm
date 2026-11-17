from typing import Literal

from pydantic import BaseModel

Audience = Literal["student", "housing_manager", "all"]


class Announcement(BaseModel):
    """A short notice shown on the portal home page and in the notifications menu."""

    id: str
    title: str
    body: str
    audience: Audience
    # Free text such as "July" or "November 2026": exact dates are set by the Housing Office.
    period: str


class KeyDate(BaseModel):
    """A step of the yearly accommodation timeline."""

    id: str
    when: str
    title: str
    note: str
