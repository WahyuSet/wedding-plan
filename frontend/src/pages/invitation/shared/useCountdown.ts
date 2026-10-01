import { useEffect, useState } from "react";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
}

export const computeCountdown = (target: Date | null, now: number = Date.now()): Countdown => {
  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  const diff = target.getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isOver: false,
  };
};

export const useCountdown = (target: Date | null): Countdown => {
  const targetMs = target ? target.getTime() : null;
  const [value, setValue] = useState<Countdown>(() => computeCountdown(target));

  useEffect(() => {
    const t = targetMs === null ? null : new Date(targetMs);
    const tick = () => setValue(computeCountdown(t));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return value;
};
