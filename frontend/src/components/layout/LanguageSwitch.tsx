import { useState } from "react";

import { cx } from "../../utils/cx";

const LANGUAGES = [
  { id: "kk", label: "KK", name: "Қазақша" },
  { id: "ru", label: "RU", name: "Русский" },
  { id: "en", label: "EN", name: "English" },
] as const;

/**
 * Interface language. Only English texts exist in this version, so KK and RU show a note
 * instead of switching. The structure is ready for all three languages (see roadmap).
 */
export default function LanguageSwitch() {
  const [note, setNote] = useState<string | null>(null);

  return (
    <div className="relative hidden items-center gap-0.5 rounded-full bg-page p-1 md:flex" role="group" aria-label="Language">
      {LANGUAGES.map((language) => {
        const active = language.id === "en";
        return (
          <button
            key={language.id}
            type="button"
            aria-pressed={active}
            title={language.name}
            onClick={() => setNote(active ? null : `${language.name} is planned for a later version.`)}
            className={cx(
              "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
              active ? "bg-surface text-text shadow-sm" : "text-muted hover:text-text",
            )}
          >
            {language.label}
          </button>
        );
      })}
      {note && (
        <p role="status" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-control bg-nav px-3 py-2 text-xs text-nav-text shadow-lg">
          {note}
        </p>
      )}
    </div>
  );
}
