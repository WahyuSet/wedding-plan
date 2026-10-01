import type React from "react";

const GOLD = "#D4AF37";
const IVORY = "#F5F0E6";
const IVORY_SHADE = "#DDD3BF";

// Keyframes are scoped by the nc- prefix; motion is fully disabled for reduced-motion users.
export const NoirCallaKeyframes: React.FC = () => (
  <style>{`
    @keyframes nc-twinkle {
      0%, 100% { opacity: 0.12; }
      50% { opacity: 0.7; }
    }
    @keyframes nc-fade {
      from { opacity: 0; transform: translate3d(0, 8px, 0); }
      to { opacity: 1; transform: translate3d(0, 0, 0); }
    }
    @keyframes nc-float {
      0%, 100% { transform: translate3d(0, 0, 0); }
      50% { transform: translate3d(0, 6px, 0); }
    }
    @keyframes nc-eq {
      0%, 100% { transform: scaleY(0.35); }
      50% { transform: scaleY(1); }
    }
    .nc-twinkle { animation: nc-twinkle var(--nc-dur, 6s) ease-in-out var(--nc-delay, 0s) infinite; }
    .nc-fade { animation: nc-fade 0.7s ease-out both; }
    .nc-float { animation: nc-float 2.2s ease-in-out infinite; }
    .nc-eq { transform-origin: 50% 100%; animation: nc-eq 0.9s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .nc-twinkle, .nc-fade, .nc-float, .nc-eq { animation: none; }
      .nc-twinkle { opacity: 0.35; }
    }
  `}</style>
);

// Ivory calla lily: back spathe, gold spadix, front fold wrapping the base, then the stem.
export const CallaLily: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={`h-32 w-16 ${className}`} viewBox="0 0 80 160" fill="none" aria-hidden="true" focusable="false">
    <path d="M40 96C42 118 37 138 41 158" stroke={GOLD} strokeOpacity="0.75" strokeWidth="1.4" strokeLinecap="round" />
    <path
      d="M40 96C18 78 10 46 26 20C31 12 38 7 46 4C45 14 48 22 56 30C68 44 62 72 40 96Z"
      fill={IVORY}
      fillOpacity="0.94"
      stroke={GOLD}
      strokeOpacity="0.45"
      strokeWidth="0.6"
    />
    <path d="M40 96C35 70 37 38 46 6" stroke={IVORY_SHADE} strokeOpacity="0.7" strokeWidth="0.7" />
    <path d="M44 60C42 48 43 36 46 29C49 36 50 48 48 60Z" fill={GOLD} />
    <path
      d="M40 96C29 81 27 62 35 47C43 58 53 61 60 52C61 69 53 84 40 96Z"
      fill={IVORY_SHADE}
      stroke={GOLD}
      strokeOpacity="0.45"
      strokeWidth="0.6"
    />
  </svg>
);

export const CallaDivider: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
    <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
    <CallaLily className="h-12 w-6" />
    <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
  </div>
);

export const MonogramFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`relative inline-flex items-center justify-center ${className}`}>
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="46" stroke={GOLD} strokeOpacity="0.6" strokeWidth="0.75" />
      <circle cx="50" cy="50" r="41" stroke={GOLD} strokeOpacity="0.3" strokeWidth="0.5" strokeDasharray="2 3" />
    </svg>
    {children}
  </div>
);

interface GoldDustProps {
  count?: number;
  className?: string;
}

// Positions are derived from the index so renders match and nothing re-randomizes.
export const GoldDust: React.FC<GoldDustProps> = ({ count = 14, className = "" }) => (
  <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
    {Array.from({ length: count }, (_, i) => {
      const size = 1 + (i % 2);
      return (
        <span
          key={i}
          className="nc-twinkle absolute rounded-full bg-[#D4AF37]"
          style={
            {
              left: `${(i * 37 + 11) % 97}%`,
              top: `${(i * 53 + 7) % 93}%`,
              width: size,
              height: size,
              "--nc-dur": `${5 + (i % 4) * 1.5}s`,
              "--nc-delay": `${(i * 0.8) % 5}s`,
            } as React.CSSProperties
          }
        />
      );
    })}
  </div>
);
