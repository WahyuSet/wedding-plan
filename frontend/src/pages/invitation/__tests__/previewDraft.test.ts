import { describe, expect, it } from "vitest";
import type { DigitalInvitation } from "../../../types/index.js";
import { buildDraftInvitation } from "../previewDraft.js";

const base = {
  id: "1",
  slug: "budi-sari",
  theme: "noir-calla",
  tone: "islami",
  timezone: "WIB",
  title: "The Wedding of",
  isMusicAutoPlay: true,
  isPublished: false,
  groomNickName: "Budi",
  brideNickName: "Sari",
  akadDate: "2026-12-20T00:00:00.000Z",
  bgMusicUrl: "https://example.com/a.mp3",
  rsvps: Array.from({ length: 8 }, (_, i) => ({
    id: String(i),
    invitationId: "1",
    guestName: `Tamu ${i}`,
    attendanceStatus: "hadir",
    guestCount: 1,
    message: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  })),
  guests: [{ id: "g1" }],
} as unknown as DigitalInvitation;

describe("buildDraftInvitation", () => {
  const draft = buildDraftInvitation({
    base,
    values: {
      theme: "nocturne-botanica",
      tone: "umum",
      timezone: "WITA",
      groomNickName: "Bagus",
      brideNickName: "  ",
      akadDate: "2027-01-05",
      resepsiDate: "",
      bgMusicUrl: "",
      theme_unknown: "x",
    },
    loveStory: [{ year: "2020", title: "Bertemu", story: "Cerita" }],
    gallery: [{ url: "https://example.com/1.jpg" }],
    bankAccounts: [],
  });

  it("menimpa data tersimpan dengan isi form dan menormalkan string kosong menjadi null", () => {
    expect(draft.theme).toBe("nocturne-botanica");
    expect(draft.tone).toBe("umum");
    expect(draft.timezone).toBe("WITA");
    expect(draft.groomNickName).toBe("Bagus");
    expect(draft.brideNickName).toBeNull();
    expect(draft.bgMusicUrl).toBeNull();
  });

  it("mengubah tanggal form menjadi ISO dan kosong menjadi null", () => {
    expect(draft.akadDate).toBe("2027-01-05T00:00:00.000Z");
    expect(draft.resepsiDate).toBeNull();
  });

  it("memakai daftar cerita/galeri/rekening dari state editor", () => {
    expect(draft.loveStory).toHaveLength(1);
    expect(draft.galleryPhotos).toHaveLength(1);
    expect(draft.bankAccounts).toEqual([]);
  });

  it("mematikan autoplay, membatasi RSVP, dan membuang data tamu", () => {
    expect(draft.isMusicAutoPlay).toBe(false);
    expect(draft.rsvps).toHaveLength(5);
    expect(draft.rsvpTotal).toBe(8);
    expect(draft.guests).toBeUndefined();
  });

  it("tidak memutasi objek asal", () => {
    expect(base.groomNickName).toBe("Budi");
    expect(base.guests).toHaveLength(1);
  });

  it("mengabaikan tema tidak dikenal", () => {
    const d = buildDraftInvitation({ base, values: { theme: "tema-palsu" }, loveStory: [], gallery: [], bankAccounts: [] });
    expect(d.theme).toBe("noir-calla");
  });
});
