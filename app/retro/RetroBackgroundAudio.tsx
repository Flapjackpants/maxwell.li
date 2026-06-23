"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Path under `public/`, e.g. `/squingMusic.mp3` */
  src?: string;
  volume?: number;
};

export function RetroBackgroundAudio({
  src = "/squingMusic.mp3",
  volume = 0.32,
}: Props) {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    audio.volume = volume;

    function tryPlay() {
      void ref.current?.play().catch(() => {
        /* autoplay blocked until interaction */
      });
    }

    tryPlay();
    document.addEventListener("pointerdown", tryPlay, { once: true });

    return () => {
      document.removeEventListener("pointerdown", tryPlay);
    };
  }, [src, volume]);

  return (
    <audio
      ref={ref}
      src={src}
      loop
      playsInline
      preload="auto"
      aria-hidden
      style={{ display: "none" }}
    />
  );
}
