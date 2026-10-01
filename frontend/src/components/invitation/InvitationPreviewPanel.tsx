import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { DigitalInvitation } from "../../types/index.js";
import { PREVIEW_MESSAGE, PREVIEW_READY_MESSAGE } from "../../pages/invitation/previewDraft.js";

interface InvitationPreviewPanelProps {
  draft: DigitalInvitation;
  onClose: () => void;
}

export const InvitationPreviewPanel: React.FC<InvitationPreviewPanelProps> = ({ draft, onClose }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const isReady = useRef(false);
  const latest = useRef(draft);
  latest.current = draft;
  const draftKey = JSON.stringify(draft);

  const send = () => {
    frameRef.current?.contentWindow?.postMessage(
      { type: PREVIEW_MESSAGE, payload: latest.current },
      window.location.origin
    );
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if ((event.data as { type?: string } | null)?.type === PREVIEW_READY_MESSAGE) {
        isReady.current = true;
        send();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!isReady.current) return;
    const id = setTimeout(send, 250);
    return () => clearTimeout(id);
  }, [draftKey]);

  return (
    <aside
      aria-label="Pratinjau undangan"
      className="fixed inset-0 z-50 sm:inset-auto sm:right-4 sm:top-28 sm:bottom-4 sm:w-[400px] flex flex-col bg-slate-900 sm:rounded-3xl shadow-2xl border border-slate-700 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2.5 text-white bg-slate-950/80">
        <p className="text-xs font-bold">Pratinjau Langsung</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pratinjau"
          className="p-1.5 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <iframe ref={frameRef} title="Pratinjau undangan" src="/invitation-preview" className="flex-1 w-full bg-slate-950" />
      <p className="px-4 py-2 text-[10px] text-slate-400 bg-slate-950/80">
        Menampilkan isi form yang belum disimpan. RSVP dan musik otomatis dimatikan di pratinjau.
      </p>
    </aside>
  );
};
