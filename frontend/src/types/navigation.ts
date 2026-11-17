import type { IconName } from "../components/ui/Icon";

export type Portal = "student" | "manager";

/**
 * `available`: a working section.
 * `module`: a section that belongs to the roommate-matching module (MODULE badge in the prototype).
 * `later`: planned for a later sprint (LATER badge in the prototype).
 */
export type NavItemStatus = "available" | "module" | "later";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: IconName;
  status: NavItemStatus;
}

export interface PortalConfig {
  id: Portal;
  /** Small label above the navigation list. */
  sidebarLabel: string;
  /** Line under the UniDorm name in the sidebar. */
  subtitle: string;
  /** Label of this portal in the role switch. */
  switchLabel: string;
  /** Where the portal starts. */
  homePath: string;
  items: NavItem[];
}
