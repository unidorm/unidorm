import type {
  DocumentItem,
  HelpTopic,
  RoomTypeOption,
  Stage,
  StatusLabel,
  SurveyCategory,
} from "../types/domain";

/** Sample data for the student portal. Replace with API responses in later stages. */

export const studentOverview: {
  firstName: string;
  greeting: string;
  academicYear: string;
  building: string;
  applicationStatus: StatusLabel;
  roomType: { value: string; status: StatusLabel };
  agreement: { value: string; status: StatusLabel };
  surveyMinutes: number;
} = {
  firstName: "Aliya",
  greeting: "Сәлем",
  academicYear: "2026/27",
  building: "Jastar City",
  applicationStatus: { label: "Registration open", tone: "accent" },
  roomType: { value: "Not chosen yet", status: { label: "Step 1 of 3", tone: "neutral" } },
  agreement: { value: "Not available", status: { label: "After room assignment", tone: "neutral" } },
  surveyMinutes: 3,
};

/** The four accommodation stages from the prototype. */
export const accommodationStages: Stage[] = [
  { id: "room-type", label: "Room type" },
  { id: "habits-survey", label: "Habits survey" },
  { id: "manager-review", label: "Manager review" },
  { id: "room-agreement", label: "Room & agreement" },
];

export const currentStageIndex = 0;

export const roomTypeOptions: RoomTypeOption[] = [
  { id: "single", capacity: 1, title: "Single", note: "No survey needed" },
  { id: "double", capacity: 2, title: "2-person", note: "Survey + pair score" },
  { id: "triple", capacity: 3, title: "3-person", note: "Survey + room score" },
  { id: "quad", capacity: 4, title: "4-person", note: "Survey + room score" },
];

/** Five survey areas and their weights (they add up to 100%), three questions each. */
export const surveyCategories: SurveyCategory[] = [
  { id: "sleep", label: "Sleep", weight: 25, questions: 3 },
  { id: "noise", label: "Noise", weight: 20, questions: 3 },
  { id: "cleanliness", label: "Cleanliness", weight: 20, questions: 3 },
  { id: "visitors", label: "Visitors", weight: 20, questions: 3 },
  { id: "study", label: "Study", weight: 15, questions: 3 },
];

export const surveyStatus = {
  label: "Not started",
  answered: 0,
  total: 15,
  answeredByCategory: { sleep: 0, noise: 0, cleanliness: 0, visitors: 0, study: 0 } as Record<string, number>,
};

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
