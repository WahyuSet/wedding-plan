import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: any): string {
  if (amount === null || amount === undefined || amount === "") return "Rp 0";
  const num = typeof amount === "number" ? amount : parseFloat(String(amount).replace(/[^0-9.-]+/g, ""));
  if (isNaN(num)) return "Rp 0";
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `Rp ${Math.round(num)}`;
  }
}

export function formatShortRupiah(amount: any): string {
  if (amount === null || amount === undefined || amount === "") return "Rp 0";
  const num = typeof amount === "number" ? amount : parseFloat(String(amount).replace(/[^0-9.-]+/g, ""));
  if (isNaN(num) || !num) return "Rp 0";
  if (num >= 1_000_000_000) {
    return `Rp ${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}jt`;
  }
  if (num >= 1_000) {
    return `Rp ${(num / 1_000).toFixed(0)}rb`;
  }
  return `Rp ${Math.round(num)}`;
}

export function formatDateIndo(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return String(dateStr);
  }
}

export function formatDateShort(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return String(dateStr);
  }
}
