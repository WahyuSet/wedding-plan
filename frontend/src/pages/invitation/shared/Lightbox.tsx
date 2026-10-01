import type React from "react";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryPhotoItem } from "../../../types/index.js";

export interface LightboxTone {
  // Classes for the round controls, including their focus ring.
  control: string;
  caption: string;
  // Optional `backdrop:` class; defaults to near-black.
  backdrop?: string;
}

interface LightboxProps {
  items: GalleryPhotoItem[];
  index: number;
  tone: LightboxTone;
  onClose: () => void;
  onChange: (next: number) => void;
}

// Native modal dialog: the browser traps focus, closes on Escape and restores focus on close.
export const Lightbox: React.FC<LightboxProps> = ({ items, index, tone, onClose, onChange }) => {
  const ref = useRef<HTMLDialogElement>(null);
  const count = items.length;
  const current = items[index];

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (!current) return null;

  // close() fires the dialog's close event, which is what reports back to the parent.
  const requestClose = () => ref.current?.close();
  const step = (delta: number) => onChange((index + delta + count) % count);
  const controlCls = `flex h-11 w-11 items-center justify-center rounded-full ${tone.control}`;

  return (
    <dialog
      ref={ref}
      aria-label={`Galeri foto, ${index + 1} dari ${count}`}
      onClose={onClose}
      onKeyDown={(e) => {
        if (count < 2) return;
        if (e.key === "ArrowLeft") step(-1);
        else if (e.key === "ArrowRight") step(1);
      }}
      className={`m-0 h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 ${tone.backdrop ?? "backdrop:bg-black/90"}`}
    >
      <div
        className="relative flex h-full w-full items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) requestClose();
        }}
      >
        <button type="button" aria-label="Tutup galeri" onClick={requestClose} className={`absolute right-4 top-4 ${controlCls}`}>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto sebelumnya"
              onClick={() => step(-1)}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${controlCls}`}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Foto berikutnya"
              onClick={() => step(1)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${controlCls}`}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
        <figure className="max-h-full max-w-full">
          <img
            src={current.url}
            alt={current.caption || `Foto galeri ${index + 1}`}
            className="max-h-[80dvh] max-w-full object-contain"
          />
          {current.caption && <figcaption className={`mt-3 text-center text-sm ${tone.caption}`}>{current.caption}</figcaption>}
        </figure>
      </div>
    </dialog>
  );
};
