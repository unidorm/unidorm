import type { ReactNode, SVGProps } from "react";

/**
 * Cartoon illustrations for UniDorm. Original artwork drawn as inline SVG (no image files):
 * rounded dark outlines, flat colours, a few small details. All are decorative, so screen
 * readers skip them (aria-hidden).
 */
export const PALETTE = {
  ink: "#1E2A44",
  navy: "#12305F",
  blue: "#2F6FDE",
  sky: "#DCE8FB",
  sun: "#F6B93B",
  mint: "#7FD3B4",
  coral: "#FF8C78",
  lilac: "#B9A7F0",
  wood: "#B9824F",
  skinA: "#F5C7A3",
  skinB: "#C98D69",
  box: "#F1D49B",
  white: "#FFFFFF",
};
const C = PALETTE;

type Props = Omit<SVGProps<SVGSVGElement>, "viewBox">;

const line = { stroke: C.ink, strokeWidth: 2.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const thin = { ...line, strokeWidth: 2 };

function Svg({ viewBox, children, ...rest }: Props & { viewBox: string; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} fill="none" aria-hidden="true" focusable="false" {...rest}>
      {children}
    </svg>
  );
}

function Sparkle({ x, y, size = 6, color = C.sun }: { x: number; y: number; size?: number; color?: string }) {
  const s = size;
  return (
    <path
      d={`M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`}
      fill={color}
      stroke={C.ink}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  );
}

function Face({ cx, cy, smile = true }: { cx: number; cy: number; smile?: boolean }) {
  return (
    <>
      <circle cx={cx - 7} cy={cy} r={2.4} fill={C.ink} />
      <circle cx={cx + 7} cy={cy} r={2.4} fill={C.ink} />
      {smile ? (
        <path d={`M${cx - 6} ${cy + 8}q6 5 12 0`} {...thin} />
      ) : (
        <path d={`M${cx - 5} ${cy + 9}h10`} {...thin} />
      )}
      <circle cx={cx - 13} cy={cy + 7} r={3} fill={C.coral} opacity={0.45} />
      <circle cx={cx + 13} cy={cy + 7} r={3} fill={C.coral} opacity={0.45} />
    </>
  );
}

/** Move-in day at the Jastar City dormitory: the building, a tree, and two students arriving. */
export function CampusScene(props: Props) {
  const windows: Array<[number, number, boolean]> = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      windows.push([138 + col * 30, 82 + row * 30, (row * 5 + col) % 3 === 1]);
    }
  }
  return (
    <Svg viewBox="0 0 440 270" {...props}>
      {/* sun and clouds */}
      <circle cx="392" cy="44" r="20" fill={C.sun} {...line} />
      <path d="M44 62q0-14 16-14 4-12 20-10 14 1 16 14 14 0 14 10H44z" fill={C.white} {...line} />
      <path d="M300 34q0-10 12-10 4-9 15-7 10 1 11 10 10 0 10 7h-48z" fill={C.white} {...thin} />

      {/* ground */}
      <path d="M0 238q220-26 440 0v32H0z" fill={C.mint} />
      <path d="M0 238q220-26 440 0" {...line} />

      {/* side wing */}
      <rect x="292" y="110" width="74" height="122" rx="8" fill={C.sky} {...line} />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x="304" y={124 + row * 30} width="20" height="18" rx="4" fill={row === 1 ? C.sun : C.white} {...thin} />
          <rect x="334" y={124 + row * 30} width="20" height="18" rx="4" fill={C.white} {...thin} />
        </g>
      ))}

      {/* main building */}
      <rect x="124" y="64" width="174" height="170" rx="10" fill={C.white} {...line} />
      <rect x="114" y="46" width="194" height="26" rx="8" fill={C.navy} {...line} />
      <text
        x="211"
        y="64"
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        letterSpacing="2"
        fill={C.white}
        fontFamily="Unbounded Variable, Nunito Variable, sans-serif"
      >
        JASTAR CITY
      </text>
      {windows.map(([x, y, lit]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="20" height="18" rx="4" fill={lit ? C.sun : C.sky} {...thin} />
      ))}
      <rect x="193" y="196" width="36" height="38" rx="6" fill={C.blue} {...line} />
      <circle cx="222" cy="216" r="2" fill={C.white} />
      <path d="M186 234h50" {...line} />

      {/* tree */}
      <rect x="72" y="186" width="12" height="48" rx="4" fill={C.wood} {...line} />
      <circle cx="78" cy="168" r="30" fill={C.mint} {...line} />
      <circle cx="66" cy="160" r="5" fill={C.white} opacity={0.6} />

      {/* student with a backpack, waving */}
      <rect x="100" y="198" width="34" height="44" rx="14" fill={C.coral} {...line} />
      <rect x="90" y="204" width="12" height="26" rx="5" fill={C.sun} {...thin} />
      <path className="animate-wave" d="M132 206q14-8 16-24" {...line} />
      <circle cx="117" cy="182" r="16" fill={C.skinA} {...line} />
      <path d="M101 180q2-17 16-17t16 17q-6-8-16-8t-16 8z" fill={C.ink} />
      <circle cx="111" cy="183" r="1.8" fill={C.ink} />
      <circle cx="123" cy="183" r="1.8" fill={C.ink} />
      <path d="M112 189q5 4 10 0" {...thin} />

      {/* student with a suitcase */}
      <rect x="378" y="198" width="34" height="44" rx="14" fill={C.lilac} {...line} />
      <circle cx="395" cy="182" r="16" fill={C.skinB} {...line} />
      <circle cx="395" cy="162" r="7" fill={C.ink} />
      <path d="M379 180q2-14 16-14t16 14q-7-6-16-6t-16 6z" fill={C.ink} />
      <circle cx="389" cy="183" r="1.8" fill={C.ink} />
      <circle cx="401" cy="183" r="1.8" fill={C.ink} />
      <path d="M390 189q5 4 10 0" {...thin} />
      <path d="M380 214q-8 6-12 12" {...line} />
      <rect x="346" y="214" width="26" height="30" rx="5" fill={C.sun} {...line} />
      <path d="M353 214v-7h12v7" {...thin} />
      <path d="M352 226h14" {...thin} />

      <Sparkle x={170} y={30} size={6} />
      <Sparkle x={262} y={24} size={4} color={C.white} />
    </Svg>
  );
}

/** Two roommates with matching habits: the roommate-matching page picture. */
export function RoommatesScene(props: Props) {
  return (
    <Svg viewBox="0 0 320 210" {...props}>
      {/* window with a moon */}
      <rect x="122" y="16" width="76" height="62" rx="12" fill={C.sky} {...line} />
      <circle cx="172" cy="38" r="10" fill={C.sun} />
      <circle cx="177" cy="34" r="9" fill={C.sky} />
      <path d="M160 16v62M122 47h76" {...line} />

      {/* floor and rug */}
      <ellipse cx="160" cy="190" rx="120" ry="12" fill={C.sky} />
      <path d="M14 190h292" {...line} />

      {/* left roommate with headphones */}
      <rect x="40" y="104" width="70" height="86" rx="35" fill={C.coral} {...line} />
      <circle cx="75" cy="84" r="26" fill={C.skinA} {...line} />
      <path d="M49 81q2-25 26-25t26 25q-9-12-26-11-16 0-26 11z" fill={C.ink} />
      <Face cx={75} cy={84} />
      <path d="M49 80q0-30 26-30t26 30" {...line} />
      <rect x="43" y="76" width="9" height="16" rx="4" fill={C.blue} {...thin} />
      <rect x="98" y="76" width="9" height="16" rx="4" fill={C.blue} {...thin} />

      {/* right roommate with a book */}
      <rect x="210" y="104" width="70" height="86" rx="35" fill={C.mint} {...line} />
      <circle cx="245" cy="84" r="26" fill={C.skinB} {...line} />
      <circle cx="245" cy="54" r="10" fill={C.ink} />
      <path d="M220 80q4-20 25-20t25 20q-11-9-25-9t-25 9z" fill={C.ink} />
      <Face cx={245} cy={84} />
      <path d="M226 140q10-6 19 0 9-6 19 0v22q-10-6-19 0-9-6-19 0z" fill={C.white} {...thin} />
      <path d="M245 140v22" {...thin} />

      {/* matching score bubble */}
      <rect x="128" y="96" width="64" height="40" rx="14" fill={C.white} {...line} />
      <path d="M152 136l8 10 6-10" fill={C.white} {...line} />
      <text x="160" y="122" textAnchor="middle" fontSize="16" fontWeight="700" fill={C.ink} fontFamily="Unbounded Variable, Nunito Variable, sans-serif">
        90%
      </text>
      <Sparkle x={120} y={92} />
      <Sparkle x={202} y={88} size={5} color={C.lilac} />
    </Svg>
  );
}

/** The four "how it works" steps. */
export function StepArt({ step, ...props }: Props & { step: "room" | "survey" | "review" | "agreement" }) {
  const art = {
    room: (
      <>
        <rect x="30" y="18" width="36" height="62" rx="6" fill={C.blue} {...line} />
        <circle cx="58" cy="52" r="3" fill={C.sun} />
        <rect x="38" y="28" width="20" height="10" rx="3" fill={C.white} {...thin} />
        <path d="M22 80h52" {...line} />
        <Sparkle x={76} y={24} size={5} />
      </>
    ),
    survey: (
      <>
        <rect x="24" y="18" width="46" height="62" rx="8" fill={C.white} {...line} />
        <rect x="37" y="12" width="20" height="12" rx="4" fill={C.sun} {...thin} />
        <rect x="32" y="34" width="9" height="9" rx="2" fill={C.mint} {...thin} />
        <rect x="32" y="52" width="9" height="9" rx="2" fill={C.mint} {...thin} />
        <path d="M46 38h16M46 56h12" {...thin} />
        <path d="M60 78l16-24 6 4-16 24-8 3z" fill={C.coral} {...thin} />
      </>
    ),
    review: (
      <>
        <circle cx="34" cy="46" r="11" fill={C.skinA} {...thin} />
        <circle cx="58" cy="46" r="11" fill={C.skinB} {...thin} />
        <circle cx="46" cy="46" r="26" fill={C.white} fillOpacity={0.35} {...line} />
        <path d="M65 65l14 14" {...line} strokeWidth={5} />
        <circle cx="31" cy="44" r="1.6" fill={C.ink} />
        <circle cx="37" cy="44" r="1.6" fill={C.ink} />
        <circle cx="55" cy="44" r="1.6" fill={C.ink} />
        <circle cx="61" cy="44" r="1.6" fill={C.ink} />
      </>
    ),
    agreement: (
      <>
        <rect x="22" y="16" width="44" height="58" rx="6" fill={C.white} {...line} />
        <path d="M31 30h26M31 40h26M31 50h16" {...thin} />
        <path d="M30 63q6-6 10 0t10 0" stroke={C.blue} strokeWidth={2} strokeLinecap="round" />
        <circle cx="68" cy="66" r="12" fill={C.sun} {...line} />
        <path d="M76 74l8 8M80 78l-3 3" {...line} />
      </>
    ),
  }[step];
  return <Svg viewBox="0 0 96 96" {...props}>{art}</Svg>;
}

/** Doodle for each survey area. */
export function CategoryDoodle({
  category,
  ...props
}: Props & { category: "sleep" | "noise" | "cleanliness" | "visitors" | "study" }) {
  const art = {
    sleep: (
      <>
        <path d="M30 10a14 14 0 1 0 8 24A16 16 0 0 1 30 10z" fill={C.sun} {...thin} />
        <path d="M36 12h5l-5 5h5" {...thin} strokeWidth={1.5} />
      </>
    ),
    noise: (
      <>
        <path d="M12 28v-4a12 12 0 0 1 24 0v4" {...thin} />
        <rect x="8" y="26" width="9" height="13" rx="4" fill={C.coral} {...thin} />
        <rect x="31" y="26" width="9" height="13" rx="4" fill={C.coral} {...thin} />
      </>
    ),
    cleanliness: (
      <>
        <circle cx="18" cy="28" r="9" fill={C.mint} {...thin} />
        <circle cx="32" cy="20" r="6" fill={C.white} {...thin} />
        <circle cx="31" cy="34" r="4" fill={C.mint} {...thin} />
        <Sparkle x={14} y={12} size={4} />
      </>
    ),
    visitors: (
      <>
        <rect x="13" y="8" width="22" height="32" rx="5" fill={C.lilac} {...thin} />
        <circle cx="29" cy="25" r="2" fill={C.ink} />
        <path d="M8 40h32" {...thin} />
      </>
    ),
    study: (
      <>
        <path d="M24 14q-8-5-17-3v24q9-2 17 3z" fill={C.sky} {...thin} />
        <path d="M24 14q8-5 17-3v24q-9-2-17 3z" fill={C.white} {...thin} />
        <path d="M28 19q4-1.5 9-1M28 25q4-1.5 9-1" {...thin} strokeWidth={1.5} />
      </>
    ),
  }[category];
  return <Svg viewBox="0 0 48 48" {...props}>{art}</Svg>;
}

/** Row of little beds, one per person, for the room type options. */
export function Beds({ count, ...props }: Props & { count: number }) {
  const width = count * 32 + 4;
  return (
    <Svg viewBox={`0 0 ${width} 34`} width={width} height={34} {...props}>
      {Array.from({ length: count }, (_, i) => {
        const x = 4 + i * 32;
        return (
          <g key={i}>
            <rect x={x} y="6" width="6" height="24" rx="2" fill={C.blue} {...thin} />
            <rect x={x} y="16" width="26" height="12" rx="4" fill={C.sky} {...thin} />
            <rect x={x + 8} y="11" width="9" height="6" rx="2.5" fill={C.white} {...thin} strokeWidth={1.75} />
          </g>
        );
      })}
    </Svg>
  );
}

/** Document with a coloured corner, for the documents list. */
export function DocumentArt({ color = C.sky, ...props }: Props & { color?: string }) {
  return (
    <Svg viewBox="0 0 48 48" {...props}>
      <path d="M12 6h17l9 9v27H12z" fill={C.white} {...thin} />
      <path d="M29 6v9h9" fill={color} {...thin} />
      <path d="M18 24h14M18 30h14M18 36h8" {...thin} strokeWidth={1.75} />
    </Svg>
  );
}

/** A box with a face: empty lists. */
export function EmptyBox(props: Props) {
  return (
    <Svg viewBox="0 0 160 120" {...props}>
      <path d="M20 108h120" {...line} />
      <path d="M35 50l-12-16h58l-1 16" fill={C.box} {...line} />
      <path d="M125 50l12-16H79l1 16" fill={C.box} {...line} />
      <rect x="35" y="50" width="90" height="56" rx="8" fill={C.box} {...line} />
      <circle cx="66" cy="76" r="3" fill={C.ink} />
      <circle cx="94" cy="76" r="3" fill={C.ink} />
      <ellipse cx="80" cy="88" rx="4" ry="3.2" fill={C.ink} />
      <Sparkle x={30} y={22} size={5} />
    </Svg>
  );
}

/** A confused door: page not found. */
export function LostDoor(props: Props) {
  return (
    <Svg viewBox="0 0 180 170" {...props}>
      <path d="M20 152h140" {...line} />
      <rect x="55" y="28" width="70" height="124" rx="12" fill={C.sky} {...line} />
      <circle cx="112" cy="96" r="4" fill={C.sun} {...thin} />
      <circle cx="78" cy="70" r="3" fill={C.ink} />
      <circle cx="100" cy="70" r="3" fill={C.ink} />
      <path d="M78 86q5-4 11 0t11 0" {...line} />
      <path d="M140 30q0-12 12-12t12 11q0 8-10 12v6" {...line} strokeWidth={3} />
      <circle cx="154" cy="56" r="2.5" fill={C.ink} />
    </Svg>
  );
}

/** Traffic cone and barrier: sections planned for a later sprint. */
export function UnderConstruction(props: Props) {
  return (
    <Svg viewBox="0 0 120 80" {...props}>
      <path d="M10 72h100" {...line} />
      <path d="M30 70l12-50h8l12 50z" fill={C.coral} {...line} />
      <path d="M38 44h16M35 56h22" stroke={C.white} strokeWidth={5} />
      <path d="M26 70h40" {...line} />
      <rect x="70" y="34" width="40" height="14" rx="4" fill={C.sun} {...line} />
      <path d="M80 34l-6 14M92 34l-6 14M104 34l-6 14" stroke={C.ink} strokeWidth={2} />
      <path d="M76 48v24M104 48v24" {...line} />
    </Svg>
  );
}

/** Speech bubbles for the help contact card. */
export function HelpBubbles(props: Props) {
  return (
    <Svg viewBox="0 0 120 90" {...props}>
      <rect x="8" y="10" width="64" height="42" rx="14" fill={C.sky} {...line} />
      <path d="M24 52l-4 14 16-14" fill={C.sky} {...line} />
      <path d="M34 26q0-8 8-8t8 7q0 5-6 8v4" {...line} />
      <circle cx="44" cy="44" r="1.8" fill={C.ink} />
      <rect x="56" y="38" width="56" height="34" rx="12" fill={C.sun} {...line} />
      <path d="M96 72l6 12-16-12" fill={C.sun} {...line} />
      <circle cx="72" cy="55" r="3" fill={C.ink} />
      <circle cx="84" cy="55" r="3" fill={C.ink} />
      <circle cx="96" cy="55" r="3" fill={C.ink} />
    </Svg>
  );
}

/** Housing manager at a desk, for the manager portal. */
export function ManagerDesk(props: Props) {
  return (
    <Svg viewBox="0 0 200 140" {...props}>
      <rect x="62" y="48" width="56" height="58" rx="24" fill={C.blue} {...line} />
      <circle cx="90" cy="34" r="20" fill={C.skinA} {...line} />
      <path d="M70 32q2-20 20-20t20 20q-8-8-20-8t-20 8z" fill={C.ink} />
      <circle cx="84" cy="36" r="2" fill={C.ink} />
      <circle cx="96" cy="36" r="2" fill={C.ink} />
      <path d="M85 43q5 4 10 0" {...thin} />
      <path d="M20 104h160" {...line} />
      <rect x="28" y="96" width="144" height="10" rx="3" fill={C.wood} {...line} />
      <rect x="110" y="62" width="50" height="34" rx="5" fill={C.sky} {...line} />
      <path d="M118 84l8-8 8 5 12-12" stroke={C.blue} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M126 96h18" {...line} />
      <rect x="36" y="78" width="26" height="18" rx="3" fill={C.white} {...thin} />
      <path d="M42 86h14" {...thin} />
      <path d="M106 106v26M60 106v26" {...line} />
    </Svg>
  );
}
