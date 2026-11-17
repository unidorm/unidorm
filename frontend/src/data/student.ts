import type {
  DocumentItem,
  HelpTopic,
  RoomTypeOption,
  Stage,
} from "../types/domain";

/** Fixed text for the student portal. Everything about the signed-in student comes from the API. */

/** The four accommodation stages from the prototype. */
export const accommodationStages: Stage[] = [
  { id: "room-type", label: "Room type" },
  { id: "habits-survey", label: "Habits survey" },
  { id: "manager-review", label: "Manager review" },
  { id: "room-agreement", label: "Room & agreement" },
];

/** Text and picture for each accommodation stage, shown in "How it works" (same order as the stages). */
export const howItWorks: Array<{ stageId: string; art: "room" | "survey" | "review" | "agreement"; text: string }> = [
  { stageId: "room-type", art: "room", text: "Choose a single room, or a shared room for 2, 3 or 4 students." },
  { stageId: "habits-survey", art: "survey", text: "Answer 15 questions about sleep, noise, cleanliness, visitors and study." },
  { stageId: "manager-review", art: "review", text: "The housing manager checks the scores and makes the final decision." },
  { stageId: "room-agreement", art: "agreement", text: "See your room and sign a roommate agreement made from your answers." },
];

export const roomTypeOptions: RoomTypeOption[] = [
  { id: "single", capacity: 1, title: "Single room", note: "Live alone. No survey needed." },
  { id: "double", capacity: 2, title: "2-person room", note: "Habits survey, then a pair score." },
  { id: "triple", capacity: 3, title: "3-person room", note: "Habits survey, then a room score." },
  { id: "quad", capacity: 4, title: "4-person room", note: "Habits survey, then a room score." },
];

export const surveyDataUse: string[] = [
  "Only your survey answers are used for the score. No medical, social or priority data.",
  "A rule-based score compares you with possible roommates in five areas.",
  "The housing manager makes the final decision, not the system.",
  "Your roommates see your habits, not your personal data.",
];

export const dormRulesNote =
  "Shared rooms in Jastar City hold 2, 3 or 4 students. Students who ask to live alone skip the habits survey. " +
  "Smoking, alcohol, pets and gender are covered by dorm rules, not by this survey.";

export const documents: DocumentItem[] = [
  {
    id: "application",
    title: "Accommodation application",
    description: "Jastar City · academic year 2026/27",
    status: { label: "Registration open", tone: "accent" },
  },
  {
    id: "agreement",
    title: "Roommate agreement",
    description: "Created from your survey answers after the housing manager confirms your room.",
    status: { label: "Not available", tone: "neutral" },
  },
  {
    id: "rules",
    title: "KBTU dormitory rules",
    description: "Always come first. The roommate agreement cannot change them.",
    status: { label: "Fixed text", tone: "success" },
  },
];

export const helpTopics: HelpTopic[] = [
  {
    id: "how-it-works",
    title: "How accommodation works",
    description: "Four stages: room type, habits survey, manager review, then your room and agreement.",
  },
  {
    id: "survey",
    title: "The habits survey",
    description: "15 short questions about sleep, noise, cleanliness, visitors and study. There are no wrong answers.",
  },
  {
    id: "score",
    title: "Compatibility score",
    description: "A fixed set of rules compares answers. The same answers always give the same score.",
  },
  {
    id: "agreement",
    title: "Roommate agreement",
    description: "Filled from your answers. You can change any line before you sign, and both roommates must sign.",
  },
  {
    id: "rules",
    title: "Dormitory rules",
    description: "Smoking, alcohol, pets and gender are covered by KBTU dormitory rules, not by the survey.",
  },
];
