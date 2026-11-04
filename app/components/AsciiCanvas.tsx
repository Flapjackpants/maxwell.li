"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { asciiLines } from "@/lib/ascii";

/*
 * Draws an image as ASCII text in a canvas. The image is fetched once when the
 * canvas nears the viewport, then redrawn only when the text size step or the
 * element size changes. Color and font come from the canvas' computed style.
 */
export function AsciiCanvas({
  src,
  textSize,
  className,
}: {
  src: string;
  textSize: number | MotionValue<number>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let image: HTMLImageElement | null = null;
    const offscreen = document.createElement("canvas");

    const draw = () => {
      if (cancelled || !image?.complete || image.naturalWidth === 0) return;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;

      const size = typeof textSize === "number" ? textSize : textSize.get();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;

      const style = getComputedStyle(canvas);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = style.getPropertyValue("--n-950");
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${size}px ${style.fontFamily}`;
      ctx.textBaseline = "top";

      const charW = ctx.measureText("M").width;
      const cols = Math.ceil(w / charW);
      const rows = Math.ceil(h / size);
      if (cols === 0 || rows === 0) return;

      const naturalW = image.naturalWidth;
      const naturalH = image.naturalHeight;
      const targetAspect = w / h;
      const sourceAspect = naturalW / naturalH;
      let sw = naturalW;
      let sh = naturalH;
      let sx = 0;
      let sy = 0;
      if (sourceAspect > targetAspect) {
        sw = naturalH * targetAspect;
        sx = (naturalW - sw) / 2;
      } else {
        sh = naturalW / targetAspect;
        sy = (naturalH - sh) / 2;
      }

      offscreen.width = cols;
      offscreen.height = rows;
      const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!offCtx) return;
      offCtx.drawImage(image, sx, sy, sw, sh, 0, 0, cols, rows);
      const lines = asciiLines(
        offCtx.getImageData(0, 0, cols, rows).data,
        cols,
        rows,
      );

      ctx.fillStyle = style.color;
      lines.forEach((line, index) => ctx.fillText(line, 0, index * size));
    };

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);

    const intersection = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        intersection.disconnect();
        const loaded = new window.Image();
        image = loaded;
        loaded.onload = () => {
          if (cancelled) return;
          document.fonts.ready.then(draw);
        };
        loaded.src = `/_next/image?url=${encodeURIComponent(src)}&w=384&q=75`;
      },
      { rootMargin: "50% 0px" },
    );
    intersection.observe(canvas);

    const unsubscribe =
      typeof textSize === "number" ? undefined : textSize.on("change", draw);

    return () => {
      cancelled = true;
      observer.disconnect();
      intersection.disconnect();
      unsubscribe?.();
      if (image) image.onload = null;
    };
  }, [src, textSize]);

  return (
    <canvas
      ref={canvasRef}
      className={`ascii-canvas ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}
