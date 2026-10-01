import type { InvitationCopy } from "./invitationCopy.js";
import type { MusicController } from "./useMusic.js";
import type { ParsedInvitation } from "./parseInvitation.js";
import type { RsvpPayload } from "./useRsvpForm.js";

export interface InvitationGuestInfo {
  name: string;
  code?: string;
}

export interface InvitationThemeProps {
  data: ParsedInvitation;
  guest: InvitationGuestInfo | null;
  music: MusicController;
  copy: InvitationCopy;
  rsvp: {
    submit: (payload: RsvpPayload) => Promise<void>;
    isPending: boolean;
  };
}
