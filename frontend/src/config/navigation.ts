import type { PortalConfig, Portal } from "../types/navigation";
import { ROUTES } from "./routes";

/** Navigation for both portals. The two menus are intentionally different. */
export const PORTALS: Record<Portal, PortalConfig> = {
  student: {
    id: "student",
    sidebarLabel: "Student portal",
    subtitle: "Student accommodation · Jastar City",
    switchLabel: "Student",
    homePath: ROUTES.student.home,
    items: [
      { id: "home", label: "Home", path: ROUTES.student.home, icon: "home", status: "available" },
      {
        id: "accommodation",
        label: "Accommodation",
        path: ROUTES.student.accommodation,
        icon: "building",
        status: "available",
      },
      {
        id: "roommate-matching",
        label: "Roommate matching",
        path: ROUTES.student.roommateMatching,
        icon: "users",
        status: "module",
      },
      { id: "documents", label: "Documents", path: ROUTES.student.documents, icon: "file", status: "available" },
      { id: "payments", label: "Payments", path: ROUTES.student.payments, icon: "card", status: "later" },
      { id: "help", label: "Help", path: ROUTES.student.help, icon: "help", status: "available" },
    ],
  },
  manager: {
    id: "manager",
    sidebarLabel: "Housing office",
    subtitle: "Housing Office · Jastar City",
    switchLabel: "Housing manager",
    homePath: ROUTES.manager.rooms,
    items: [
      { id: "rooms", label: "Rooms", path: ROUTES.manager.rooms, icon: "door", status: "available" },
      { id: "dashboard", label: "Dashboard", path: ROUTES.manager.dashboard, icon: "dashboard", status: "later" },
      {
        id: "feedback",
        label: "Feedback surveys",
        path: ROUTES.manager.feedback,
        icon: "message",
        status: "later",
      },
      {
        id: "relocations",
        label: "Relocation requests",
        path: ROUTES.manager.relocations,
        icon: "swap",
        status: "later",
      },
    ],
  },
};

export const PORTAL_ORDER: Portal[] = ["student", "manager"];
