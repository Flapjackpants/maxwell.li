"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Period between glitch flashes */
const INTERVAL_MS = 100_000;
/** How long each image shows the substitute (fraction of a second) */
const FLASH_MS = 100;

type Props = {
  children: ReactNode;
  /** Temporary `src` for every `<img>` under this tree during each flash */
  flashSrc: string;
};

export function RetroImageFlash({ children, flashSrc }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function flash() {
      const node = rootRef.current;
      if (!node) return;
      const imgs = node.querySelectorAll<HTMLImageElement>("img");
      const snapshots: Array<{ el: HTMLImageElement; src: string }> = [];
      for (const el of imgs) {
        const src = el.getAttribute("src");
        if (src == null) continue;
        snapshots.push({ el, src });
        el.setAttribute("src", flashSrc);
      }
      if (snapshots.length === 0) return;

      window.setTimeout(() => {
        for (const { el, src } of snapshots) {
          el.setAttribute("src", src);
        }
      }, FLASH_MS);
    }

    const id = window.setInterval(flash, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [flashSrc]);

  return <div ref={rootRef}>{children}</div>;
}
