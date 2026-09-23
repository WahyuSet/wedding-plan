import React from "react";

export const GoldDivider: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={`w-32 h-4 mx-auto ${className}`} viewBox="0 0 128 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 8h52M76 8h52" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.5" />
    <path d="M64 2l4 6-4 6-4-6z" fill="#D4AF37" fillOpacity="0.6" />
    <circle cx="56" cy="8" r="1.5" fill="#D4AF37" fillOpacity="0.4" />
    <circle cx="72" cy="8" r="1.5" fill="#D4AF37" fillOpacity="0.4" />
  </svg>
);

export const CornerOrnament: React.FC<{ position: "tl" | "tr" | "bl" | "br"; className?: string }> = ({ position, className = "" }) => {
  const rotation = { tl: 0, tr: 90, br: 180, bl: 270 }[position];
  return (
    <svg
      className={`absolute w-16 h-16 sm:w-24 sm:h-24 pointer-events-none opacity-30 ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 4c0 0 20 0 40 20S88 64 92 92" stroke="#D4AF37" strokeWidth="0.75" />
      <path d="M4 4c0 0 10 10 15 30" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.5" />
      <circle cx="4" cy="4" r="2" fill="#D4AF37" fillOpacity="0.6" />
    </svg>
  );
};

export const MonogramFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`relative inline-flex items-center justify-center ${className}`}>
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="#D4AF37" strokeWidth="0.75" strokeOpacity="0.5" />
      <circle cx="50" cy="50" r="42" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.25" strokeDasharray="3 3" />
    </svg>
    {children}
  </div>
);

export const CallaLilyAccent: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={`w-8 h-16 ${className}`} viewBox="0 0 32 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 60c0 0-2-20-2-35" stroke="#D4AF37" strokeWidth="0.75" strokeOpacity="0.4" />
    <path d="M14 25C10 15 6 10 8 5c2-5 8-3 8 2s-2 10-2 18z" fill="#D4AF37" fillOpacity="0.15" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.4" />
    <path d="M14 25c4-10 8-15 6-20s-8-3-8 2 2 10 2 18z" fill="#D4AF37" fillOpacity="0.1" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.3" />
    <ellipse cx="15" cy="12" rx="1.5" ry="4" fill="#D4AF37" fillOpacity="0.3" />
  </svg>
);

export const StarField: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    {[
      [50, 100], [150, 50], [300, 150], [80, 300], [350, 280],
      [200, 400], [120, 500], [280, 550], [60, 650], [340, 700],
      [180, 200], [250, 350], [100, 450], [320, 480], [170, 620],
    ].map(([cx, cy], i) => (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={i % 3 === 0 ? 1.2 : 0.7}
        fill="#D4AF37"
        fillOpacity={0.15 + (i % 4) * 0.08}
        className={i % 2 === 0 ? "animate-twinkle" : ""}
        style={i % 2 === 0 ? { animationDelay: `${(i * 0.7) % 5}s` } : undefined}
      />
    ))}
  </svg>
);
