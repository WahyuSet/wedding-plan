import type React from "react";

const CHALK = "#F4EFE6";
const SAGE = "#8CA68C";
const LEAF = "M0 0C5-8 17-9 24 0C17 9 5 8 0 0Z";

// Keyframes are scoped by the cv- prefix; motion is fully disabled for reduced-motion users.
export const ChalkKeyframes: React.FC = () => (
  <style>{`
    @keyframes cv-fade {
      from { opacity: 0; transform: translate3d(0, 10px, 0); }
      to { opacity: 1; transform: translate3d(0, 0, 0); }
    }
    @keyframes cv-eq {
      0%, 100% { transform: scaleY(0.35); }
      50% { transform: scaleY(1); }
    }
    .cv-fade { animation: cv-fade 0.6s ease-out both; }
    .cv-eq { transform-origin: 50% 100%; animation: cv-eq 0.9s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .cv-fade, .cv-eq { animation: none; }
    }
  `}</style>
);

// [x, y, rotation, scale] for leaves along the two stems of the corner sprig.
const SPRIG_LEAVES: ReadonlyArray<readonly [number, number, number, number]> = [
  [70, 45, -35, 1],
  [88, 50, 40, 0.9],
  [112, 59, -25, 0.95],
  [132, 70, 50, 0.85],
  [152, 84, -15, 0.75],
  [46, 70, 20, 0.9],
  [50, 88, 140, 1],
  [58, 110, 35, 0.85],
  [68, 130, 150, 0.9],
  [84, 154, 50, 0.75],
];

// TODO(aset): ornamen sementara. Ganti isi komponen ini dengan ilustrasi bunga kapur final.
export const ChalkSprig: React.FC<{ position: "tl" | "br"; className?: string }> = ({ position, className = "" }) => (
  <svg
    className={`pointer-events-none absolute ${
      position === "tl" ? "left-5 top-5" : "bottom-5 right-5 rotate-180"
    } ${className}`}
    viewBox="0 0 190 190"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <g stroke={CHALK} strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 40C80 44 130 62 176 104" strokeOpacity="0.55" strokeWidth="1.2" />
      <path d="M40 40C44 80 62 130 104 176" strokeOpacity="0.55" strokeWidth="1.2" />
      <path d="M40 40C70 70 96 92 128 128" strokeOpacity="0.3" strokeWidth="0.8" />
      {SPRIG_LEAVES.map(([x, y, rot, s], i) => (
        <path
          key={i}
          d={LEAF}
          transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
          fill={SAGE}
          fillOpacity="0.28"
          strokeOpacity="0.7"
          strokeWidth="0.9"
        />
      ))}
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="40"
          cy="24"
          rx="8"
          ry="14"
          transform={`rotate(${angle} 40 40)`}
          fill={CHALK}
          fillOpacity="0.12"
          strokeOpacity="0.8"
          strokeWidth="1"
        />
      ))}
    </g>
    <circle cx="40" cy="40" r="4" fill={SAGE} fillOpacity="0.9" />
    {[
      [78, 76],
      [98, 94],
      [128, 128],
      [176, 104],
      [104, 176],
    ].map(([cx, cy]) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.2" fill={CHALK} fillOpacity="0.6" />
    ))}
  </svg>
);

// Hand-drawn chalk underline; colour follows the current text colour.
export const ChalkStroke: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={`h-3 w-28 ${className}`}
    viewBox="0 0 120 12"
    fill="none"
    aria-hidden="true"
    focusable="false"
    preserveAspectRatio="none"
  >
    <path d="M3 7C20 3 34 10 54 6S90 3 117 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 9C30 7 60 10 108 8" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// Sprigs follow the screen height so they stay clear of the centred cover text on short phones.
const SPRIG_SIZE =
  "h-20 w-20 [@media(min-height:700px)]:h-28 [@media(min-height:700px)]:w-28 [@media(min-height:800px)]:h-40 [@media(min-height:800px)]:w-40";

interface BoardSurfaceProps {
  frame?: boolean;
  sprigs?: boolean;
}

// The chalkboard, built from layers so the frame stays whole at any screen ratio.
export const BoardSurface: React.FC<BoardSurfaceProps> = ({ frame = false, sprigs = false }) => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-[#16241E]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 28% 18%, rgba(244,239,230,0.06), transparent 55%), radial-gradient(ellipse at 76% 82%, rgba(244,239,230,0.045), transparent 50%)",
      }}
    />
    {frame && (
      <>
        <div className="absolute inset-3 border border-[#C4A882]/70" />
        <div className="absolute inset-[18px] border border-[#C4A882]/35" />
      </>
    )}
    {sprigs && (
      <>
        <ChalkSprig position="tl" className={SPRIG_SIZE} />
        <ChalkSprig position="br" className={SPRIG_SIZE} />
      </>
    )}
  </div>
);
