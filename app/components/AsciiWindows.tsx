"use client";

import { useEffect, useRef } from "react";
import { crossFrame } from "@/lib/ascii";
import { AsciiCanvas } from "./AsciiCanvas";
import { WinBar } from "./VaporArt";

const COLS = 44;
const ROWS = 30;
const START_ANGLE = 0.6;
const FRAME_MS = 80;
const SPIN_RATE = 0.0012;

/*
 * A slowly spinning Byzantine cross drawn as ASCII. Frames are written straight
 * to the node's textContent so the animation never re-renders React. Pauses
 * while offscreen and stays on the starting frame for reduced motion.
 */
export function AsciiCross() {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = false;
    let frame = 0;
    let angle = START_ANGLE;
    let last = 0;

    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
    });
    observer.observe(node);

    const loop = (time: number) => {
      if (last === 0) {
        last = time;
      } else if (visible && time - last >= FRAME_MS) {
        angle += (time - last) * SPIN_RATE;
        last = time;
        node.textContent = crossFrame(angle, COLS, ROWS);
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <pre ref={ref} className="ascii-cross" aria-hidden="true">
      {crossFrame(START_ANGLE, COLS, ROWS)}
    </pre>
  );
}

export function CrossWindow({ className }: { className?: string }) {
  return (
    <div className={`hud-panel cross-window ${className ?? ""}`} aria-hidden="true">
      <WinBar />
      <div className="cross-window__body">
        <AsciiCross />
      </div>
    </div>
  );
}

export function TerminalWindow({
  src,
  textSize = 7,
  className,
}: {
  src: string;
  textSize?: number;
  className?: string;
}) {
  return (
    <div className={`hud-panel terminal ${className ?? ""}`} aria-hidden="true">
      <WinBar />
      <div className="terminal__body">
        <p className="terminal__prompt">{`C:\\> asciiify ${src.slice(1)}`}</p>
        <AsciiCanvas src={src} textSize={textSize} className="terminal__canvas" />
      </div>
    </div>
  );
}
