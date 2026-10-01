import { useCallback, useEffect, useRef, useState } from "react";

export interface MusicController {
  hasMusic: boolean;
  isPlaying: boolean;
  // Dipanggil saat undangan dibuka; hanya memutar jika autoplay diaktifkan.
  start: () => void;
  toggle: () => void;
}

// Satu-satunya pemilik elemen audio. `isPlaying` mengikuti event audio sebenarnya,
// sehingga ikon selalu sinkron dengan suara yang terdengar.
export const useMusic = (url: string | null | undefined, autoPlayOnOpen: boolean): MusicController => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!url) return;
    const audio = new Audio(url);
    audio.loop = true;
    audio.preload = "auto";
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
      audioRef.current = null;
      setIsPlaying(false);
    };
  }, [url]);

  const start = useCallback(() => {
    if (!autoPlayOnOpen) return;
    audioRef.current?.play().catch(() => {});
  }, [autoPlayOnOpen]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, []);

  return { hasMusic: Boolean(url), isPlaying, start, toggle };
};
