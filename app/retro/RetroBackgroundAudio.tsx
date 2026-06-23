"use client";

import { useEffect, useRef, useState } from "react";
import { retroBtnStyle } from "@/lib/retro-theme";

type Props = {
  /** Path under `public/`, e.g. `/retro-bg.mp3` */
  src?: string;
  volume?: number;
};

export function RetroBackgroundAudio({
  src = "squingMusic.mp3",
  volume = 0.32,
}: Props) {
  const ref = useRef<HTMLAudioElement>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    audio.volume = volume;

    function tryPlay() {
      const a = ref.current;
      if (!a) return;
      a.play()
        .then(() => setNeedsTap(false))
        .catch(() => setNeedsTap(true));
    }

    tryPlay();
    document.addEventListener("pointerdown", tryPlay, { once: true });

    return () => {
      document.removeEventListener("pointerdown", tryPlay);
    };
  }, [src, volume]);

  return (
    <>
      <audio ref={ref} src={src} loop playsInline preload="auto" />
      <p style={{ textAlign: "center", margin: "8px 0 4px" }}>
        <button
          type="button"
          style={retroBtnStyle}
          onClick={() => {
            const el = ref.current;
            if (!el) return;
            el.volume = volume;
            el.play().catch(() => setNeedsTap(true));
          }}
        >
          {needsTap
            ? "[ CLICK HERE FOR BACKGROUND MP3 ]"
            : "[ REPLAY / UN-PAUSE ]"}
        </button>
      </p>
    </>
  );
}
