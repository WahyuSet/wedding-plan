import type {
  BankAccountItem,
  DigitalInvitation,
  GalleryPhotoItem,
  LoveStoryItem,
} from "../../types/index.js";

export const PREVIEW_MESSAGE = "invitation-preview";
export const PREVIEW_READY_MESSAGE = "invitation-preview-ready";

const NULLABLE_TEXT_FIELDS = [
  "openingQuote",
  "quoteSource",
  "bgMusicUrl",
  "coverPhotoUrl",
  "heroPhotoUrl",
  "groomFullName",
  "groomNickName",
  "groomFather",
  "groomMother",
  "groomInstagram",
  "groomPhotoUrl",
  "brideFullName",
  "brideNickName",
  "brideFather",
  "brideMother",
  "brideInstagram",
  "bridePhotoUrl",
  "akadStartTime",
  "akadEndTime",
  "akadVenueName",
  "akadAddress",
  "akadMapUrl",
  "resepsiStartTime",
  "resepsiEndTime",
  "resepsiVenueName",
  "resepsiAddress",
  "resepsiMapUrl",
  "giftAddress",
] as const;

const toIsoDate = (value: unknown): string | null =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) ? `${value.slice(0, 10)}T00:00:00.000Z` : null;

interface DraftInput {
  base: DigitalInvitation;
  values: Record<string, unknown>;
  loveStory: LoveStoryItem[];
  gallery: GalleryPhotoItem[];
  bankAccounts: BankAccountItem[];
}

// Menggabungkan data tersimpan dengan isi form yang belum disimpan menjadi objek undangan utuh.
export const buildDraftInvitation = ({ base, values, loveStory, gallery, bankAccounts }: DraftInput): DigitalInvitation => {
  const draft: DigitalInvitation = { ...base };
  const target = draft as unknown as Record<string, unknown>;

  for (const key of NULLABLE_TEXT_FIELDS) {
    const value = values[key];
    if (typeof value === "string") target[key] = value.trim() === "" ? null : value;
  }

  if (typeof values.title === "string") draft.title = values.title;
  if (values.theme === "noir-calla" || values.theme === "chalk-and-vow" || values.theme === "nocturne-botanica") {
    draft.theme = values.theme;
  }
  if (values.tone === "islami" || values.tone === "umum") draft.tone = values.tone;
  if (values.timezone === "WIB" || values.timezone === "WITA" || values.timezone === "WIT") {
    draft.timezone = values.timezone;
  }

  draft.akadDate = toIsoDate(values.akadDate);
  draft.resepsiDate = toIsoDate(values.resepsiDate);

  draft.loveStory = loveStory;
  draft.galleryPhotos = gallery;
  draft.bankAccounts = bankAccounts;

  // Pratinjau tidak boleh memutar musik sendiri atau menampilkan data tamu sungguhan.
  draft.isMusicAutoPlay = false;
  draft.rsvps = (base.rsvps ?? []).slice(0, 5).map((r) => ({ ...r, message: r.message }));
  draft.rsvpTotal = base.rsvps?.length ?? 0;
  delete draft.guests;

  return draft;
};
