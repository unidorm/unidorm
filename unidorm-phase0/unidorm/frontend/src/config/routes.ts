/** Single source of truth for application paths. Used by the router, the navigation and links. */
export const ROUTES = {
  student: {
    root: "/student",
    home: "/student/home",
    accommodation: "/student/accommodation",
    roommateMatching: "/student/roommate-matching",
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
