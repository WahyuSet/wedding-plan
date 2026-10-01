import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DigitalInvitation } from "../../types/index.js";
import { InvitationView } from "./InvitationView.js";
import { PREVIEW_MESSAGE, PREVIEW_READY_MESSAGE } from "./previewDraft.js";

const PREVIEW_GUEST = { name: "Nama Tamu Undangan" };

// Dibuka di dalam iframe oleh halaman admin; data draft dikirim lewat postMessage (same-origin saja).
export const InvitationPreviewPage: React.FC = () => {
  const [invitation, setInvitation] = useState<DigitalInvitation | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== window.parent) return;
      const data = event.data as { type?: string; payload?: DigitalInvitation } | null;
      if (data?.type === PREVIEW_MESSAGE && data.payload) setInvitation(data.payload);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_READY_MESSAGE }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!invitation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
        Memuat pratinjau...
      </div>
    );
  }

  return (
    <InvitationView
      invitation={invitation}
      guest={PREVIEW_GUEST}
      onRsvpSubmit={async () => {
        toast.info("Mode pratinjau: RSVP tidak dikirim.");
      }}
      isSubmittingRsvp={false}
    />
  );
};
