import { describe, expect, it } from "vitest";
import { buildIcs, googleCalendarUrl } from "../calendar.js";
import { computeCountdown } from "../useCountdown.js";
import { datePart, eventDateTime, formatEventDate, formatTimeRange } from "../eventDate.js";
import { parseJsonList } from "../parseInvitation.js";
import { getCopy } from "../invitationCopy.js";

describe("eventDate", () => {
  it("mengambil bagian tanggal dari ISO", () => {
    expect(datePart("2026-12-20T00:00:00.000Z")).toBe("2026-12-20");
    expect(datePart("bukan tanggal")).toBeNull();
    expect(datePart(null)).toBeNull();
  });

  it("menggabungkan tanggal + jam dengan zona waktu", () => {
    expect(eventDateTime("2026-12-20T00:00:00.000Z", "08:00", "WIB")?.toISOString()).toBe("2026-12-20T01:00:00.000Z");
    expect(eventDateTime("2026-12-20T00:00:00.000Z", "08:00", "WITA")?.toISOString()).toBe("2026-12-20T00:00:00.000Z");
    expect(eventDateTime("2026-12-20T00:00:00.000Z", "08:00", "WIT")?.toISOString()).toBe("2026-12-19T23:00:00.000Z");
    expect(eventDateTime(null, "08:00", "WIB")).toBeNull();
  });

  it("memformat tanggal Indonesia tanpa bergeser hari", () => {
    expect(formatEventDate("2026-12-20T00:00:00.000Z")).toBe("Minggu, 20 Desember 2026");
  });

  it("memformat rentang waktu", () => {
    expect(formatTimeRange("08:00", "10:00", "WITA")).toBe("Pukul 08:00 - 10:00 WITA");
    expect(formatTimeRange("11:00", "Selesai", "WIB")).toBe("Pukul 11:00 - Selesai WIB");
    expect(formatTimeRange("11:00", "", undefined)).toBe("Pukul 11:00 - Selesai WIB");
  });
});

describe("computeCountdown", () => {
  it("menghitung selisih", () => {
    const target = new Date("2026-01-02T03:04:05Z");
    const now = new Date("2026-01-01T00:00:00Z").getTime();
    expect(computeCountdown(target, now)).toEqual({ days: 1, hours: 3, minutes: 4, seconds: 5, isOver: false });
  });

  it("nol jika sudah lewat atau tanpa target", () => {
    expect(computeCountdown(new Date(0), Date.now()).isOver).toBe(true);
    expect(computeCountdown(null).isOver).toBe(true);
  });
});

describe("calendar", () => {
  const event = {
    title: "Akad Nikah: Budi & Sari",
    date: "2026-12-20T00:00:00.000Z",
    startTime: "08:00",
    endTime: "10:00",
    timezone: "WIB",
    location: "Masjid Agung, Semarang",
    description: "Undangan; pernikahan, dengan koma",
  };

  it("membuat tautan Google Calendar dalam UTC", () => {
    const url = new URL(googleCalendarUrl(event)!);
    expect(url.searchParams.get("dates")).toBe("20261220T010000Z/20261220T030000Z");
    expect(url.searchParams.get("text")).toBe(event.title);
  });

  it("membuat ICS valid dan meng-escape karakter khusus", () => {
    const ics = buildIcs(event, new Date("2026-09-01T00:00:00Z"))!;
    expect(ics).toContain("DTSTART:20261220T010000Z");
    expect(ics).toContain("DTEND:20261220T030000Z");
    expect(ics).toContain("LOCATION:Masjid Agung\\, Semarang");
    expect(ics).toContain("DESCRIPTION:Undangan\\; pernikahan\\, dengan koma");
    expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
  });

  it("durasi bawaan 2 jam jika jam selesai tidak valid", () => {
    const url = new URL(googleCalendarUrl({ ...event, endTime: "Selesai" })!);
    expect(url.searchParams.get("dates")).toBe("20261220T010000Z/20261220T030000Z");
  });

  it("null jika tanggal tidak ada", () => {
    expect(googleCalendarUrl({ ...event, date: null })).toBeNull();
    expect(buildIcs({ ...event, date: null })).toBeNull();
  });
});

describe("parseJsonList & copy", () => {
  it("parse aman untuk array, string JSON, dan data rusak", () => {
    expect(parseJsonList<number>([1, 2])).toEqual([1, 2]);
    expect(parseJsonList<number>("[1,2]")).toEqual([1, 2]);
    expect(parseJsonList<number>("{rusak")).toEqual([]);
    expect(parseJsonList<number>(null)).toEqual([]);
    expect(parseJsonList<number>('{"a":1}')).toEqual([]);
  });

  it("teks bawaan mengikuti tone", () => {
    expect(getCopy("islami").ceremonyLabel).toBe("Akad Nikah");
    expect(getCopy("umum").ceremonyLabel).toBe("Upacara Pernikahan");
    expect(getCopy(undefined).badge).toBe("Walimatul 'Ursy");
  });
});
