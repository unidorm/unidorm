import type { ReactNode } from "react";

import { usePageTitle } from "../../hooks/usePageTitle";
import { CampusScene } from "../illustrations/Illustrations";
import { Doodles, Mascot } from "../illustrations/Mascot";

/** Two-column frame for the sign-in and registration pages: KBTU panel on the left, the form on the right. */
export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  usePageTitle(title);

  return (
    <div className="flex min-h-full flex-col bg-page lg:flex-row">
      <aside className="relative flex flex-col justify-between gap-8 overflow-hidden bg-nav px-6 py-8 text-nav-text sm:px-10 lg:w-[44%] lg:py-12">
        <Doodles className="opacity-70" />
        <div className="relative flex items-center gap-3">
          <span
            className="grid size-11 place-items-center rounded-control bg-white font-display text-[0.6875rem] font-bold tracking-wide text-nav"
            aria-hidden="true"
          >
            KBTU
          </span>
          <span>
            <span className="block font-display text-lg font-semibold leading-tight">
              Uni<span className="text-highlight">Dorm</span>
            </span>
            <span className="block text-xs text-nav-muted">Student housing · Jastar City</span>
          </span>
        </div>
        <div className="relative hidden lg:block">
          <div className="rounded-card bg-white/95 p-4">
            <CampusScene className="w-full" />
          </div>
          <p className="mt-6 max-w-md font-display text-2xl font-semibold leading-snug">
            Apply for a room, find a roommate with similar habits, sign your agreement.
          </p>
        </div>
        <p className="relative hidden text-xs text-nav-muted lg:block">KBTU Housing Office · Jastar City dormitory</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Mascot mood="wave" className="mb-4 size-20" />
          <h1 className="font-display text-3xl font-semibold leading-tight">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
