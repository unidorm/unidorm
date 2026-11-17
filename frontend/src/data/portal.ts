import type { Announcement, KeyDate } from "../types/domain";

/**
 * Local copy of the portal information served by GET /api/portal/*.
 * Used when the backend is not running, so the pages never look empty.
 * Keep it in sync with backend/app/services/portal.py.
 */
export const sampleAnnouncements: Announcement[] = [
  {
    id: "registration-open",
    title: "Accommodation registration for 2026/27",
    body: "Returning students register in July and first-year students in August, through UniDorm/WSP.",
    audience: "student",
    period: "July – August",
  },
  {
    id: "roommate-matching",
    title: "New: roommate matching",
    body: "If you ask for a shared room, a 15-question habits survey helps the housing manager find compatible roommates.",
    audience: "student",
    period: "This academic year",
  },
  {
    id: "pilot",
    title: "Pilot in Jastar City",
    body: "About 30 volunteer students test roommate matching before the full launch.",
    audience: "all",
    period: "November 2026",
  },
  {
    id: "review-queue",
    title: "Room groups are waiting for review",
    body: "Scores and red flags are ready for the proposed groups. The final decision is yours.",
    audience: "housing_manager",
    period: "This week",
  },
];

export const sampleKeyDates: KeyDate[] = [
  { id: "returning", when: "July", title: "Registration for returning students", note: "Choose a room type in UniDorm/WSP." },
  { id: "first-year", when: "August", title: "Registration for first-year students", note: "Shared-room requests include the habits survey." },
  { id: "move-in", when: "Before classes", title: "Room and agreement", note: "The housing manager confirms rooms, then roommates sign the agreement." },
  { id: "feedback-1", when: "2 weeks after move-in", title: "First feedback survey", note: "Anonymous, a few short questions." },
  { id: "feedback-2", when: "End of semester", title: "Second feedback survey", note: "Helps to improve matching next year." },
];
