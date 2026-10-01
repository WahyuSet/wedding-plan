import type {
  BankAccountItem,
  DigitalInvitation,
  GalleryPhotoItem,
  InvitationRsvp,
  LoveStoryItem,
} from "../../../types/index.js";
import { withoutSchemaDefaultPhoto } from "../../../lib/invitationDefaults.js";

export interface ParsedInvitation {
  invitation: DigitalInvitation;
  loveStories: LoveStoryItem[];
  gallery: GalleryPhotoItem[];
  bankAccounts: BankAccountItem[];
  rsvps: InvitationRsvp[];
  rsvpTotal: number;
}

export const parseJsonList = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const parseInvitation = (invitation: DigitalInvitation): ParsedInvitation => {
  const rsvps = invitation.rsvps ?? [];
  return {
    invitation: {
      ...invitation,
      coverPhotoUrl: withoutSchemaDefaultPhoto(invitation.coverPhotoUrl),
      heroPhotoUrl: withoutSchemaDefaultPhoto(invitation.heroPhotoUrl),
    },
    loveStories: parseJsonList<LoveStoryItem>(invitation.loveStory),
    gallery: parseJsonList<GalleryPhotoItem>(invitation.galleryPhotos).filter((p) => Boolean(p?.url)),
    bankAccounts: parseJsonList<BankAccountItem>(invitation.bankAccounts),
    rsvps,
    rsvpTotal: invitation.rsvpTotal ?? rsvps.length,
  };
};
