import React from "react";
import { cn } from "../../lib/utils.js";

export interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  colorVariant?: "rose" | "emerald" | "amber" | "blue" | "auto";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  colorVariant = "auto",
  size = "md",
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  let fillColor = "bg-[#E11D48]";
  if (colorVariant === "auto") {
    if (percentage >= 80) fillColor = "bg-emerald-500";
    else if (percentage >= 50) fillColor = "bg-amber-500";
    else fillColor = "bg-[#E11D48]";
  } else if (colorVariant === "emerald") {
    fillColor = "bg-emerald-500";
  } else if (colorVariant === "amber") {
    fillColor = "bg-amber-500";
  } else if (colorVariant === "rose") {
    fillColor = "bg-[#E11D48]";
  } else if (colorVariant === "blue") {
    fillColor = "bg-blue-500";
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          {label && <span className="text-slate-600">{label}</span>}
          {showPercentage && <span className="text-slate-900 font-bold ml-auto">{percentage}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden p-0.5", sizeStyles[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", fillColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
