"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  useMotionValue,
  useReducedMotion,
  useScroll,
  type MotionValue,
} from "framer-motion";

const PIN_QUERY = "(min-width: 768px)";

/** True once mounted on a viewport wide enough to pin, with motion allowed. */
export function useScrubEnabled() {
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY);
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return wide && !reduced;
}

/*
 * A tall scroll track with a sticky stage. Children get scroll progress
 * 0 → 1 (scene top enters viewport bottom → scene end leaves). When pinning
 * is off (narrow viewport, reduced motion) progress is held at 1, so
 * children render in their final, fully revealed state.
 */
export function ScrollScene({
  steps,
  className,
  children,
}: {
  steps: number;
  className?: string;
  children: (progress: MotionValue<number>) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useScrubEnabled();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const settled = useMotionValue(1);

  return (
    <div
      ref={ref}
      className={className ? `scene ${className}` : "scene"}
      style={{ "--scene-steps": steps } as CSSProperties}
    >
      <div className="scene__stage">
        {children(enabled ? scrollYProgress : settled)}
      </div>
    </div>
  );
}
