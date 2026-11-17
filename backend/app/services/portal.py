"""Portal information: announcements and the yearly accommodation timeline.

Stage 1 keeps this as sample content in code. It is based on the project documents
(registration through UniDorm/WSP in July and August, the Jastar City pilot, two feedback
surveys). A later stage moves it to the database so the Housing Office can edit it.
"""

from app.schemas.portal import Announcement, Audience, KeyDate

_ANNOUNCEMENTS: list[Announcement] = [
    Announcement(
        id="registration-open",
        title="Accommodation registration for 2026/27",
        body="Returning students register in July and first-year students in August, through UniDorm/WSP.",
        audience="student",
        period="July – August",
    ),
    Announcement(
        id="roommate-matching",
        title="New: roommate matching",
        body="If you ask for a shared room, a 15-question habits survey helps the housing manager find "
        "compatible roommates.",
        audience="student",
        period="This academic year",
    ),
    Announcement(
        id="pilot",
        title="Pilot in Jastar City",
        body="About 30 volunteer students test roommate matching before the full launch.",
        audience="all",
        period="November 2026",
    ),
    Announcement(
        id="review-queue",
        title="Room groups are waiting for review",
        body="Scores and red flags are ready for the proposed groups. The final decision is yours.",
        audience="housing_manager",
        period="This week",
    ),
]

_KEY_DATES: list[KeyDate] = [
    KeyDate(id="returning", when="July", title="Registration for returning students",
            note="Choose a room type in UniDorm/WSP."),
    KeyDate(id="first-year", when="August", title="Registration for first-year students",
            note="Shared-room requests include the habits survey."),
    KeyDate(id="move-in", when="Before classes", title="Room and agreement",
            note="The housing manager confirms rooms, then roommates sign the agreement."),
    KeyDate(id="feedback-1", when="2 weeks after move-in", title="First feedback survey",
            note="Anonymous, a few short questions."),
    KeyDate(id="feedback-2", when="End of semester", title="Second feedback survey",
            note="Helps to improve matching next year."),
]


def list_announcements(audience: Audience | None = None) -> list[Announcement]:
    """Announcements for one audience (plus the ones for everybody), or all of them."""
    if audience is None or audience == "all":
        return list(_ANNOUNCEMENTS)
    return [item for item in _ANNOUNCEMENTS if item.audience in (audience, "all")]


def list_key_dates() -> list[KeyDate]:
    return list(_KEY_DATES)
