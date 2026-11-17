import type { CSSProperties, ReactNode, SVGProps } from "react";

import { cx } from "../../utils/cx";
import { PALETTE as C } from "./Illustrations";

type Mood = "happy" | "wave" | "cheer" | "think" | "sleepy";

const line = { stroke: C.ink, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const thin = { ...line, strokeWidth: 2.4 };

/**
 * Üishik ("little house"), the UniDorm character: a small dorm house with a face.
 * Used for loading, empty, error and success moments and for short tips. Decorative only.
 */
export function Mascot({ mood = "happy", className, ...rest }: Omit<SVGProps<SVGSVGElement>, "viewBox"> & { mood?: Mood }) {
  const eyesClosed = mood === "cheer" || mood === "sleepy";
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" focusable="false" className={className} {...rest}>
      {/* shadow */}
      <ellipse cx="60" cy="112" rx="30" ry="4.5" fill={C.ink} opacity="0.12" />

      {/* arms: one waves or both go up */}
      {mood === "wave" && (
        <g className="animate-wave">
          <path d="M88 76q14-6 16-22" {...line} />
          <circle cx="104" cy="52" r="5" fill={C.white} {...thin} />
        </g>
      )}
      {mood === "cheer" && (
        <>
          <path d="M32 74q-14-8-14-24" {...line} />
          <circle cx="18" cy="48" r="5" fill={C.white} {...thin} />
          <path d="M88 74q14-8 14-24" {...line} />
          <circle cx="102" cy="48" r="5" fill={C.white} {...thin} />
        </>
      )}
      {mood === "think" && (
        <>
          <path d="M88 82q10 0 8-12" {...line} />
          <circle cx="95" cy="68" r="5" fill={C.white} {...thin} />
        </>
      )}

      {/* body */}
      <rect x="30" y="50" width="60" height="58" rx="12" fill={C.white} {...line} />
      {/* roof */}
      <path d="M22 56 60 22l38 34q2 3-2 4H24q-4-1-2-4z" fill={C.coral} {...line} />
      {/* chimney */}
      <path d="M78 36V24h9v20" fill={C.coral} {...line} />
      {mood === "sleepy" && (
        <text x="92" y="20" fontSize="14" fontWeight="700" fill={C.blue} fontFamily="Unbounded Variable, sans-serif">
          z
        </text>
      )}
      {/* round window in the roof */}
      <circle cx="60" cy="44" r="6" fill={C.sun} {...thin} />

      {/* face */}
      {eyesClosed ? (
        <>
          <path d="M45 74q4-4 8 0M67 74q4-4 8 0" {...thin} />
        </>
      ) : mood === "think" ? (
        <>
          <circle cx="50" cy="73" r="3.4" fill={C.ink} />
          <circle cx="71" cy="71" r="3.4" fill={C.ink} />
          <circle cx="51.2" cy="71.8" r="1.1" fill={C.white} />
          <circle cx="72.2" cy="69.8" r="1.1" fill={C.white} />
        </>
      ) : (
        <>
          <circle cx="49" cy="73" r="3.4" fill={C.ink} />
          <circle cx="71" cy="73" r="3.4" fill={C.ink} />
          <circle cx="50.2" cy="71.8" r="1.1" fill={C.white} />
          <circle cx="72.2" cy="71.8" r="1.1" fill={C.white} />
        </>
      )}
      {mood === "think" ? (
        <path d="M54 86q6-3 12 0" {...thin} />
      ) : mood === "cheer" ? (
        <path d="M51 82q9 11 18 0z" fill={C.coral} {...thin} />
      ) : (
        <path d="M53 83q7 6 14 0" {...thin} />
      )}
      <circle cx="42" cy="82" r="4" fill={C.coral} opacity="0.5" />
      <circle cx="78" cy="82" r="4" fill={C.coral} opacity="0.5" />

      {/* little door */}
      <path d="M54 108V98a6 6 0 0 1 12 0v10" fill={C.sky} {...thin} />
    </svg>
  );
}

/** The character with a speech bubble next to it. */
export function MascotTip({
  mood = "happy",
  children,
  className,
  bob = false,
}: {
  mood?: Mood;
  children: ReactNode;
  className?: string;
  bob?: boolean;
}) {
  return (
    <div className={cx("flex items-end gap-3", className)}>
      <Mascot mood={mood} className={cx("size-16 shrink-0", bob && "animate-bob")} />
      <p className="relative mb-3 rounded-2xl rounded-bl-sm bg-surface px-4 py-2.5 text-sm font-semibold leading-snug shadow-sm shadow-text/5">
        {children}
      </p>
    </div>
  );
}

/** Yellow hand-drawn squiggle under a word in a heading. */
export function Squiggle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx("relative inline-block whitespace-nowrap", className)}>
      <span className="relative z-10">{children}</span>
      <svg
        viewBox="0 0 120 12"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute -bottom-1.5 left-0 h-3 w-full"
      >
        <path d="M2 8q10-7 20 0t20 0 20 0 20 0 20 0 16-1" fill="none" stroke={C.sun} strokeWidth="4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** A few twinkling stars, dots and a heart, scattered over a banner (each keeps its own shape at any banner size). */
const DOODLES: Array<{ kind: "star" | "dot" | "heart"; top: string; left: string; size: number; color: string; delay?: string }> = [
  { kind: "star", top: "8%", left: "3%", size: 18, color: C.sun, delay: "0s" },
  { kind: "dot", top: "6%", left: "36%", size: 8, color: C.coral },
  { kind: "heart", top: "4%", left: "84%", size: 18, color: C.coral },
  { kind: "star", top: "10%", left: "93%", size: 16, color: C.lilac, delay: "0.8s" },
  { kind: "dot", top: "72%", left: "1.5%", size: 9, color: C.blue },
  { kind: "star", top: "88%", left: "52%", size: 13, color: C.sun, delay: "1.4s" },
  { kind: "star", top: "78%", left: "96%", size: 13, color: C.mint, delay: "0.4s" },
  { kind: "dot", top: "93%", left: "74%", size: 8, color: C.lilac },
];

export function Doodles({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cx("pointer-events-none absolute inset-0", className)}>
      {DOODLES.map((item) => (
        <svg
          key={`${item.top}-${item.left}`}
          viewBox="0 0 20 20"
          width={item.size}
          height={item.size}
          className={cx("absolute", item.kind === "star" && "animate-twinkle")}
          style={{ top: item.top, left: item.left, animationDelay: item.delay }}
        >
          {item.kind === "star" && <path d="M10 0Q10 10 20 10Q10 10 10 20Q10 10 0 10Q10 10 10 0Z" fill={item.color} />}
          {item.kind === "dot" && <circle cx="10" cy="10" r="9" fill={item.color} opacity="0.55" />}
          {item.kind === "heart" && (
            <path d="M10 18C2 12 0 7 3 4c2.5-2.5 5.5-1 7 1.5C11.5 3 14.5 1.5 17 4c3 3 1 8-7 14z" fill={item.color} opacity="0.8" />
          )}
        </svg>
      ))}
    </div>
  );
}

/** One short burst of paper confetti (for the "submitted" moment). Purely decorative. */
export function Confetti({ className }: { className?: string }) {
  const colors = [C.sun, C.coral, C.mint, C.lilac, C.blue];
  const pieces = Array.from({ length: 26 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    delay: `${(i % 7) * 0.08}s`,
    drift: `${((i * 53) % 80) - 40}px`,
    color: colors[i % colors.length],
    round: i % 3 === 0,
  }));
  return (
    <div aria-hidden="true" className={cx("pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden", className)}>
      {pieces.map((piece, i) => (
        <span
          key={i}
          className={cx("confetti-piece absolute top-0 block", piece.round ? "size-2 rounded-full" : "h-3 w-1.5 rounded-sm")}
          style={{ left: piece.left, background: piece.color, animationDelay: piece.delay, "--drift": piece.drift } as CSSProperties}
        />
      ))}
    </div>
  );
}
