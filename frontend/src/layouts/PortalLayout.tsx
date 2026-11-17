import { useEffect, useId, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { PORTALS } from "../config/navigation";
import type { Portal } from "../types/navigation";
import { cx } from "../utils/cx";

/**
 * Shared shell for both portals: sidebar on the left, header on top, page content below.
 * The portal prop selects the navigation and the sample user. On screens below `lg`
 * the sidebar becomes a drawer opened from the header.
 */
export default function PortalLayout({ portal }: { portal: Portal }) {
  const config = PORTALS[portal];
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const menuId = useId();

  // A new page closes the drawer and starts at the top.
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  // While the drawer is open: Escape closes it and the page behind it does not scroll.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        Skip to content
      </a>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-text/30 lg:hidden"
        />
      )}

      <aside
        id={menuId}
        className={cx(
          "fixed inset-y-0 left-0 z-40 w-72 bg-nav transition-[translate,visibility] duration-200",
          "lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:w-72 lg:shrink-0 lg:translate-x-0 lg:visible",
          menuOpen ? "visible translate-x-0" : "invisible -translate-x-full",
        )}
      >
        <Sidebar portal={config} onNavigate={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header portal={portal} menuOpen={menuOpen} menuId={menuId} onMenuClick={() => setMenuOpen(true)} />
        <main id="main-content" className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
