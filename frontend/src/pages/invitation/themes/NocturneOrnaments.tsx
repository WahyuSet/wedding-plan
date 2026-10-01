import type React from "react";

const LEAF = "M0 0C3-5 10-6 15 0C10 6 3 5 0 0Z";
const EMERALD = "#34D399";
const GOLD = "#EAB308";

// Keyframes are scoped by the nb- prefix; motion is fully disabled for reduced-motion users.
export const NocturneKeyframes: React.FC = () => (
  <style>{`
    @keyframes nb-firefly {
      0%, 100% { opacity: 0.08; transform: translate3d(0, 0, 0) scale(0.8); }
      35% { opacity: 0.9; transform: translate3d(10px, -18px, 0) scale(1); }
      70% { opacity: 0.25; transform: translate3d(-8px, -34px, 0) scale(0.9); }
    }
    @keyframes nb-sway {
      0%, 100% { transform: rotate(-1.5deg); }
      50% { transform: rotate(1.5deg); }
    }
    @keyframes nb-eq {
      0%, 100% { transform: scaleY(0.35); }
      50% { transform: scaleY(1); }
    }
    .nb-firefly { animation: nb-firefly var(--nb-dur, 9s) ease-in-out var(--nb-delay, 0s) infinite; }
    .nb-sway { transform-origin: 50% 100%; animation: nb-sway 7s ease-in-out infinite; }
    .nb-eq { transform-origin: 50% 100%; animation: nb-eq 0.9s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .nb-firefly, .nb-sway, .nb-eq { animation: none; }
      .nb-firefly { opacity: 0.45; }
    }
  `}</style>
);

export const LeafSprigDivider: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={`h-6 w-56 ${className}`}
    viewBox="0 0 240 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M8 12H100M140 12H232" stroke={EMERALD} strokeOpacity="0.35" strokeWidth="0.75" />
    {[0, 1, 2, 3].map((i) => {
      const x = 98 - i * 22;
      const tilt = i % 2 === 0 ? 32 : -32;
      return (
        <g key={i}>
          <path
            d={LEAF}
            transform={`translate(${x} 12) rotate(${tilt}) scale(-1 1)`}
            fill={EMERALD}
            fillOpacity={0.22 - i * 0.03}
            stroke={EMERALD}
            strokeOpacity="0.5"
            strokeWidth="0.6"
          />
          <path
            d={LEAF}
            transform={`translate(${240 - x} 12) rotate(${-tilt})`}
            fill={EMERALD}
            fillOpacity={0.22 - i * 0.03}
            stroke={EMERALD}
            strokeOpacity="0.5"
            strokeWidth="0.6"
          />
        </g>
      );
    })}
    <path d="M120 5l5 7-5 7-5-7z" fill={GOLD} fillOpacity="0.85" />
    <circle cx="106" cy="12" r="1.2" fill={GOLD} fillOpacity="0.6" />
    <circle cx="134" cy="12" r="1.2" fill={GOLD} fillOpacity="0.6" />
  </svg>
);

const CORNER_LEAVES: ReadonlyArray<readonly [number, number, number, number]> = [
  [14, 4, 8, 1.5],
  [34, 8, 40, 1.7],
  [54, 17, 6, 1.6],
  [72, 32, 62, 1.7],
  [88, 52, 28, 1.5],
  [100, 72, 84, 1.4],
  [108, 92, 50, 1.1],
];

export const CornerLeaves: React.FC<{ position: "tl" | "tr" | "bl" | "br"; className?: string }> = ({
  position,
  className = "",
}) => {
  const flip = { tl: "", tr: "-scale-x-100", bl: "-scale-y-100", br: "scale-[-1]" }[position];
  const place = {
    tl: "left-0 top-0",
    tr: "right-0 top-0",
    bl: "bottom-0 left-0",
    br: "bottom-0 right-0",
  }[position];
  return (
    <svg
      className={`pointer-events-none absolute h-28 w-28 sm:h-36 sm:w-36 ${place} ${flip} ${className}`}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 2C40 6 80 30 112 84" stroke={EMERALD} strokeOpacity="0.45" strokeWidth="0.9" />
      <path d="M2 2C18 24 26 50 24 78" stroke={GOLD} strokeOpacity="0.3" strokeWidth="0.6" />
      {CORNER_LEAVES.map(([x, y, rot, s], i) => (
        <path
          key={i}
          d={LEAF}
          transform={`translate(${x} ${y}) rotate(${i % 2 === 0 ? rot + 40 : rot - 40}) scale(${s})`}
          fill={EMERALD}
          fillOpacity={0.12 + (i % 3) * 0.05}
          stroke={EMERALD}
          strokeOpacity="0.5"
          strokeWidth="0.4"
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <path
          key={`s${i}`}
          d={LEAF}
          transform={`translate(24 ${20 + i * 17}) rotate(${i % 2 === 0 ? 70 : 110}) scale(1.1)`}
          fill={GOLD}
          fillOpacity="0.1"
          stroke={GOLD}
          strokeOpacity="0.35"
          strokeWidth="0.4"
        />
      ))}
      <circle cx="2" cy="2" r="2" fill={GOLD} fillOpacity="0.7" />
    </svg>
  );
};

const WREATH_STEPS = [0, 1, 2, 3, 4, 5, 6, 7];

export const MonogramFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`relative inline-flex items-center justify-center ${className}`}>
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="50" cy="50" r="36" stroke={GOLD} strokeOpacity="0.45" strokeWidth="0.6" />
      {[-1, 1].map((side) =>
        WREATH_STEPS.map((i) => {
          // Leaves hug the ring from the bottom up each side, meeting near the top.
          const theta = ((side === 1 ? 100 : 80) - side * i * 20) * (Math.PI / 180);
          const cx = 50 + 41 * Math.cos(theta);
          const cy = 50 + 41 * Math.sin(theta);
          const tangent = (theta * 180) / Math.PI + (side === 1 ? -90 : 90);
          const lean = i % 2 === 0 ? 24 : -24;
          return (
            <path
              key={`${side}-${i}`}
              d={LEAF}
              transform={`translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${(tangent + lean).toFixed(1)}) scale(0.62)`}
              fill={EMERALD}
              fillOpacity="0.28"
              stroke={EMERALD}
              strokeOpacity="0.55"
              strokeWidth="0.6"
            />
          );
        })
      )}
      <path d="M50 12l2.2 3.2L50 18.4l-2.2-3.2z" fill={GOLD} fillOpacity="0.9" />
    </svg>
    {children}
  </div>
);

export const FernAccent: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={`h-28 w-10 ${className}`}
    viewBox="0 0 40 120"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M20 118C18 90 22 50 20 6" stroke={EMERALD} strokeOpacity="0.5" strokeWidth="0.9" />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
      const y = 108 - i * 10;
      const s = 1.6 - i * 0.1;
      const x = 20 + (i % 2 === 0 ? -0.6 : 0.6);
      return (
        <g key={i}>
          <path
            d={LEAF}
            transform={`translate(${x} ${y}) rotate(-38) scale(${s})`}
            fill={EMERALD}
            fillOpacity="0.18"
            stroke={EMERALD}
            strokeOpacity="0.5"
            strokeWidth="0.4"
          />
          <path
            d={LEAF}
            transform={`translate(${x} ${y}) rotate(38) scale(${-s} ${s})`}
            fill={EMERALD}
            fillOpacity="0.18"
            stroke={EMERALD}
            strokeOpacity="0.5"
            strokeWidth="0.4"
          />
        </g>
      );
    })}
    <circle cx="20" cy="5" r="1.6" fill={GOLD} fillOpacity="0.8" />
  </svg>
);

export const EucalyptusSprig: React.FC<{ className?: string; flip?: boolean }> = ({
  className = "",
  flip = false,
}) => (
  <svg
    className={`h-10 w-40 ${flip ? "-scale-x-100" : ""} ${className}`}
    viewBox="0 0 160 40"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M2 22C40 16 90 30 156 18" stroke={EMERALD} strokeOpacity="0.45" strokeWidth="0.8" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const x = 16 + i * 20;
      const y = 22 - Math.sin(i * 0.9) * 3;
      const up = i % 2 === 0;
      return (
        <ellipse
          key={i}
          cx={x}
          cy={up ? y - 7 : y + 7}
          rx={6.5 - i * 0.3}
          ry={4.6 - i * 0.2}
          transform={`rotate(${up ? -25 : 25} ${x} ${up ? y - 7 : y + 7})`}
          fill={EMERALD}
          fillOpacity={0.14 + (i % 3) * 0.04}
          stroke={EMERALD}
          strokeOpacity="0.45"
          strokeWidth="0.5"
        />
      );
    })}
  </svg>
);

interface FirefliesProps {
  count?: number;
  className?: string;
}

// Positions are derived from the index so server/client renders match and nothing re-randomizes.
export const Fireflies: React.FC<FirefliesProps> = ({ count = 16, className = "" }) => (
  <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
    {Array.from({ length: count }, (_, i) => {
      const left = (i * 37 + 11) % 97;
      const top = (i * 53 + 7) % 93;
      const size = 2 + (i % 3);
      return (
        <span
          key={i}
          className="nb-firefly absolute rounded-full bg-[#FDE68A]"
          style={
            {
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              boxShadow: "0 0 8px 2px rgba(253, 230, 138, 0.55)",
              "--nb-dur": `${7 + (i % 5) * 1.7}s`,
              "--nb-delay": `${(i * 0.9) % 6}s`,
            } as React.CSSProperties
          }
        />
      );
    })}
  </div>
);
