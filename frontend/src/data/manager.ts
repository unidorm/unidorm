import type { FeedbackRound } from "../types/domain";

/**
 * Sample data for the manager pages that are not built yet (feedback surveys, relocations).
 * Room groups and the dashboard use real matching data from the API.
 */

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
