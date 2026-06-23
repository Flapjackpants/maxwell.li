"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SHOP_PLAYLIST_URLS } from "@/lib/shop/shop-media";

type Props = {
  volume?: number;
};

export function ShopBackgroundAudio({ volume = 0.32 }: Props) {
  const ref = useRef<HTMLAudioElement>(null);
  const [trackIndex, setTrackIndex] = useState(0);

  const playCurrent = useCallback(() => {
    const audio = ref.current;
    if (!audio) return;
    audio.volume = volume;
    void audio.play().catch(() => {
      /* autoplay blocked until interaction */
    });
  }, [volume]);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    audio.src = SHOP_PLAYLIST_URLS[trackIndex]!;
    playCurrent();
  }, [trackIndex, playCurrent]);

  useEffect(() => {
    function tryPlay() {
      playCurrent();
    }

    tryPlay();
    document.addEventListener("pointerdown", tryPlay, { once: true });

    return () => {
      document.removeEventListener("pointerdown", tryPlay);
    };
  }, [playCurrent]);

  function handleEnded() {
    setTrackIndex((i) => (i + 1) % SHOP_PLAYLIST_URLS.length);
  }

  return (
    <audio
      ref={ref}
      onEnded={handleEnded}
      playsInline
      preload="auto"
      aria-hidden
      style={{ display: "none" }}
    />
  );
}
