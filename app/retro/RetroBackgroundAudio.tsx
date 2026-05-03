"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const linkBtn: CSSProperties = {
  fontFamily: '"Comic Sans MS", "Comic Sans", cursive, sans-serif',
  fontSize: "12px",
  fontWeight: "bold",
  color: "#000080",
  background: "#ff0",
  border: "3px outset #fff",
  padding: "4px 10px",
  cursor: "pointer",
};

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
          style={linkBtn}
          onClick={() => {
            const el = ref.current;
            if (!el) return;
            el.volume = volume;
            el.play().catch(() => setNeedsTap(true));
          }}
        >
          {needsTap
            ? "[ CLICK HERE 4 BACKGROUND MP3!!! ]"
            : "[ REPLAY / UN-PAUSE TEH JAMZ ]"}
        </button>
      </p>
    </>
  );
}
