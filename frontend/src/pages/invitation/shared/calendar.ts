import { eventDateTime } from "./eventDate.js";

export interface CalendarEvent {
  title: string;
  date: string | null | undefined;
  startTime: string | null | undefined;
  endTime: string | null | undefined;
  timezone: string | null | undefined;
  location?: string | null;
  description?: string;
}

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

// Format UTC untuk kalender: YYYYMMDDTHHmmssZ
const toCalendarUtc = (date: Date): string => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export const resolveEventWindow = (event: CalendarEvent): { start: Date; end: Date } | null => {
  const start = eventDateTime(event.date, event.startTime, event.timezone);
  if (!start) return null;
  const end = eventDateTime(event.date, event.endTime, event.timezone);
  return { start, end: end && end > start ? end : new Date(start.getTime() + DEFAULT_DURATION_MS) };
};

export const googleCalendarUrl = (event: CalendarEvent): string | null => {
  const window = resolveEventWindow(event);
  if (!window) return null;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toCalendarUtc(window.start)}/${toCalendarUtc(window.end)}`,
    details: event.description ?? "",
    location: event.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const escapeIcsText = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");

export const buildIcs = (event: CalendarEvent, now: Date = new Date()): string | null => {
  const window = resolveEventWindow(event);
  if (!window) return null;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WeddingPlan//Undangan Digital//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${toCalendarUtc(window.start)}-${Math.abs(hash(event.title))}@weddingplan`,
    `DTSTAMP:${toCalendarUtc(now)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description ?? "")}`,
    `LOCATION:${escapeIcsText(event.location ?? "")}`,
    `DTSTART:${toCalendarUtc(window.start)}`,
    `DTEND:${toCalendarUtc(window.end)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
};

const hash = (text: string): number => {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return h;
};

export const downloadIcs = (event: CalendarEvent): boolean => {
  const ics = buildIcs(event);
  if (!ics) return false;
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^\w]+/g, "_")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};
