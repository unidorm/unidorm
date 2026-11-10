import type { Portal } from "../types/navigation";
import type { SampleUser } from "../types/domain";

/** Sample users for the two portals. No real authentication at this stage. */
export const sampleUsers: Record<Portal, SampleUser> = {
  student: {
    fullName: "Aliya S.",
    initials: "AS",
    role: "Student",
    position: "Student",
    email: "a.student@kbtu.kz",
  },
  manager: {
    fullName: "Housing Manager",
    initials: "HM",
    role: "Housing Manager",
    position: "Housing Office",
    email: "housing.manager@kbtu.kz",
  },
};
