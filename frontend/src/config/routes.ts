/** Single source of truth for application paths. Used by the router, the navigation and links. */
export const ROUTES = {
  auth: {
    login: "/login",
    register: "/register",
  },
  student: {
    root: "/student",
    home: "/student/home",
    accommodation: "/student/accommodation",
    roommateMatching: "/student/roommate-matching",
    // Under roommate-matching, so the sidebar keeps that item highlighted.
    survey: "/student/roommate-matching/survey",
    surveyReview: "/student/roommate-matching/review",
    documents: "/student/documents",
    payments: "/student/payments",
    help: "/student/help",
  },
  manager: {
    root: "/manager",
    rooms: "/manager/rooms",
    dashboard: "/manager/dashboard",
    feedback: "/manager/feedback",
    relocations: "/manager/relocations",
  },
} as const;
