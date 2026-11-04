"use client";

import { useEffect, useRef } from "react";
import { splashCells } from "@/lib/ascii";

const SPLASH_MS = 900;
const GLYPH_PX = 14;
const MAX_SPLASHES = 8;
const IGNORE_CLICK =
  "a, button, input, textarea, select, label, summary, [role='button'], .hud-panel, p, h1, h2, h3, li, img, pre, canvas";

type Splash = { x: number; y: number; start: number; seed: number };

/*
 * Draws an ASCII ripple wherever the empty page background is clicked. Splashes
 * fade out over 900ms and are painted straight onto the canvas, so clicking
 * never re-renders React. The frame loop stops once the last ripple is gone and
 * nothing runs at all under reduced motion.
 */
export function AsciiSplash() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const splashes: Splash[] = [];
    let frame = 0;

    const draw = (time: number) => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const style = getComputedStyle(canvas);
      ctx.font = `${GLYPH_PX}px ${style.fontFamily}`;
      ctx.textBaseline = "top";
      ctx.fillStyle = style.color;
      const charW = ctx.measureText("M").width;

      for (let i = splashes.length - 1; i >= 0; i -= 1) {
        if ((time - splashes[i].start) / SPLASH_MS >= 1) splashes.splice(i, 1);
      }

      for (const splash of splashes) {
        const age = (time - splash.start) / SPLASH_MS;
        for (const cell of splashCells(age, splash.seed)) {
          ctx.globalAlpha = cell.alpha;
          ctx.fillText(
            cell.char,
            splash.x + cell.dx * charW - charW / 2,
            splash.y + cell.dy * GLYPH_PX - GLYPH_PX / 2,
          );
        }
      }
      ctx.globalAlpha = 1;

      if (splashes.length > 0) {
        frame = requestAnimationFrame(draw);
      } else {
        frame = 0;
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(IGNORE_CLICK)) return;
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) return;

      splashes.push({
        x: event.clientX,
        y: event.clientY,
        start: performance.now(),
        seed: Math.floor(Math.random() * 1_000_000_000),
      });
      if (splashes.length > MAX_SPLASHES) {
        splashes.splice(0, splashes.length - MAX_SPLASHES);
      }
      if (frame === 0) frame = requestAnimationFrame(draw);
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        fontFamily: "var(--font-hud)",
        color: "color-mix(in srgb, var(--uv) 65%, var(--n-50))",
      }}
    />
  );
}
