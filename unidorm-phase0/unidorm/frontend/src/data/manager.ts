import type {
  FeedbackRound,
  OverviewFigure,
  PendingReview,
  RoomGroup,
  RoomTypeCoverage,
} from "../types/domain";

/**
 * Sample data for the housing manager portal.
 * Scores and red flags are placeholders: the scoring engine is a later stage.
 */

export const roomGroups: RoomGroup[] = [
  {
    id: "305",
    roomNumber: "305",
    proposed: true,
    capacity: 3,
    students: ["Aliya S.", "Dana B.", "Madina K."],
    score: 42,
    band: "low",
    weakestArea: "Sleep 15%",
    redFlags: 7,
  },
  {
    id: "214",
    roomNumber: "214",
    proposed: false,
    capacity: 2,
    students: ["Aruzhan M.", "Kamila T."],
    score: 90,
    band: "high",
    weakestArea: "Cleanliness 85%",
    redFlags: 0,
  },
  {
    id: "412",
    roomNumber: "412",
    proposed: false,
    capacity: 4,
    students: [],
    studentsNote: "3 of 4 surveys received",
    score: null,
    band: null,
    weakestArea: null,
    redFlags: 0,
  },
];

export const dashboardOverview: OverviewFigure[] = [
  { id: "groups", label: "Room groups", value: 3, tone: "neutral" },
  { id: "pending", label: "Waiting for review", value: 1, tone: "warning" },
  { id: "low", label: "Low compatibility", value: 1, tone: "danger" },
  { id: "surveys", label: "Waiting for surveys", value: 1, tone: "accent" },
];

export const dashboardRoomCoverage: RoomTypeCoverage[] = [
  { id: "double", label: "2-person rooms", scored: 1, total: 1 },
  { id: "triple", label: "3-person rooms", scored: 1, total: 1 },
  { id: "quad", label: "4-person rooms", scored: 0, total: 1 },
];

export const dashboardPendingReviews: PendingReview[] = [
  {
    id: "305",
    title: "Room 305 · proposed group",
    detail: "Room score 42 with 7 red flags.",
    status: { label: "Low", tone: "danger" },
  },
  {
    id: "412",
    title: "Room 412",
    detail: "One more survey is needed before the group can be scored.",
    status: { label: "Waiting", tone: "neutral" },
  },
];

export const feedbackRounds: FeedbackRound[] = [
  {
    id: "move-in",
    title: "Two weeks after move-in",
    timing: "First round",
    description: "Students say how the shared room works for them in the first weeks.",
  },
  {
    id: "end-of-semester",
    title: "End of semester",
    timing: "Second round",
    description: "A second check, so the housing office can see how groups hold up over time.",
  },
];

export const relocationColumns: string[] = ["Student", "Current room", "Requested change", "Status"];
