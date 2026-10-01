import React, { Suspense, useEffect, useMemo } from "react";
import type { DigitalInvitation } from "../../types/index.js";
import { resolveThemeId } from "../../lib/invitationThemes.js";
import { THEME_COMPONENTS } from "./themeRegistry.js";
import { parseInvitation } from "./shared/parseInvitation.js";
import { getCopy } from "./shared/invitationCopy.js";
import { useMusic } from "./shared/useMusic.js";
import type { InvitationGuestInfo } from "./shared/types.js";
import type { RsvpPayload } from "./shared/useRsvpForm.js";

interface InvitationViewProps {
  invitation: DigitalInvitation;
  guest: InvitationGuestInfo | null;
  onRsvpSubmit: (payload: RsvpPayload) => Promise<void>;
  isSubmittingRsvp: boolean;
}

const ThemeFallback: React.FC = () => (
  <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Halaman undangan berisi data pribadi, jadi jangan diindeks mesin pencari.
const useNoIndex = (title: string) => {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    const previousTitle = document.title;
    document.title = title;
    return () => {
      meta.remove();
      document.title = previousTitle;
    };
  }, [title]);
};

export const InvitationView: React.FC<InvitationViewProps> = ({
  invitation,
  guest,
  onRsvpSubmit,
  isSubmittingRsvp,
}) => {
  const data = useMemo(() => parseInvitation(invitation), [invitation]);
  const music = useMusic(invitation.bgMusicUrl, invitation.isMusicAutoPlay);
  const copy = getCopy(invitation.tone);
  const Theme = THEME_COMPONENTS[resolveThemeId(invitation.theme)];

  const couple = [invitation.groomNickName, invitation.brideNickName].filter(Boolean).join(" & ");
  useNoIndex(couple ? `${invitation.title || "The Wedding of"} ${couple}` : "Undangan Pernikahan");

  return (
    <Suspense fallback={<ThemeFallback />}>
      <Theme
        data={data}
        guest={guest}
        music={music}
        copy={copy}
        rsvp={{ submit: onRsvpSubmit, isPending: isSubmittingRsvp }}
      />
    </Suspense>
  );
};
