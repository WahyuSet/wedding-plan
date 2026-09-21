import React from "react";
import { cn } from "../../lib/utils.js";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "neutral" | "rose" | "gold" | "blue";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  ...props
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-medium tracking-wide",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/60",
    danger: "bg-rose-50 text-rose-700 border border-rose-200/60 animate-pulse",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200/60",
    rose: "bg-rose-50 text-[#E11D48] border border-rose-200/60",
    gold: "bg-amber-50 text-[#B45309] border border-amber-200/60",
    blue: "bg-blue-50 text-blue-700 border border-blue-200/60",
  };

  const dotColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    neutral: "bg-slate-400",
    rose: "bg-[#E11D48]",
    gold: "bg-amber-500",
    blue: "bg-blue-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />}
      {children}
    </span>
  );
};
