import type { DigitalInvitation, InvitationTimezone } from "../../../types/index.js";

const TZ_OFFSET: Record<InvitationTimezone, string> = {
  WIB: "+07:00",
  WITA: "+08:00",
  WIT: "+09:00",
};

export const tzLabel = (tz?: string | null): InvitationTimezone =>
  tz === "WITA" || tz === "WIT" ? tz : "WIB";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

// Tanggal disimpan sebagai tengah malam UTC dari input "YYYY-MM-DD"; ambil bagian tanggalnya saja.
export const datePart = (iso?: string | null): string | null => {
  if (!iso) return null;
  const match = /^\d{4}-\d{2}-\d{2}/.exec(iso);
  return match ? match[0] : null;
};

export const formatEventDate = (iso?: string | null): string => {
  const part = datePart(iso);
  if (!part) return "";
  const date = new Date(`${part}T00:00:00Z`);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

export const eventDateTime = (
  iso: string | null | undefined,
  time: string | null | undefined,
  tz?: string | null
): Date | null => {
  const part = datePart(iso);
  if (!part) return null;
  const clock = time && TIME_PATTERN.test(time) ? time : "00:00";
  const date = new Date(`${part}T${clock}:00${TZ_OFFSET[tzLabel(tz)]}`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getEventStart = (invitation: DigitalInvitation): Date | null =>
  eventDateTime(invitation.akadDate, invitation.akadStartTime, invitation.timezone) ??
  eventDateTime(invitation.resepsiDate, invitation.resepsiStartTime, invitation.timezone);

export const formatTimeRange = (start?: string | null, end?: string | null, tz?: string | null): string => {
  const from = start && TIME_PATTERN.test(start) ? start : "";
  const to = end && TIME_PATTERN.test(end) ? end : "Selesai";
  const label = tzLabel(tz);
  if (!from) return `Waktu akan diinformasikan ${label}`;
  return `Pukul ${from} - ${to} ${label}`;
};
