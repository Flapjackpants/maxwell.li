"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import type { HomeAboutBlock } from "@/lib/home-content";
import { ScrollScene, useScrubEnabled } from "./ScrollScene";

const pad = (n: number) => String(n).padStart(2, "0");

/* ─── Hero: large portrait that drifts while the copy lifts away ────────── */
export function HeroScene({
  imageUrl,
  children,
}: {
  imageUrl: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useScrubEnabled();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const settled = useMotionValue(0);
  const p = enabled ? scrollYProgress : settled;

  const imageScale = useTransform(p, [0, 1], [1, 1.12]);
  const imageY = useTransform(p, [0, 1], ["0%", "8%"]);
  const copyY = useTransform(p, [0, 0.8], ["0%", "-30%"]);
  const copyOpacity = useTransform(p, [0, 0.7], [1, 0]);

  return (
    <div ref={ref} className="hero__inner grid-12">
      <div className="hero__portrait">
        <motion.div
          className="hero__portrait-inner"
          style={{ scale: imageScale, y: imageY }}
        >
          <Image
            src={imageUrl}
            alt="Profile"
            fill
            className="img-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            preload
          />
        </motion.div>
      </div>
      <motion.div
        className="hero__copy"
        style={{ y: copyY, opacity: copyOpacity }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ─── About: pinned stage, mosaic wipes in, then the copy arrives ───────── */
const CELL_START = 0.1;
const CELL_STAGGER = 0.08;
const CELL_SPAN = 0.35;
const COPY_RANGE = [0.45, 0.75];

function MosaicCell({
  src,
  order,
  progress,
}: {
  src: string;
  order: number;
  progress: MotionValue<number>;
}) {
  const start = CELL_START + order * CELL_STAGGER;
  const range = [start, start + CELL_SPAN];
  const clipPath = useTransform(progress, range, [
    "inset(100% 0% 0% 0%)",
    "inset(0% 0% 0% 0%)",
  ]);
  const scale = useTransform(progress, range, [1.25, 1]);

  return (
    <motion.div className="mosaic__cell" style={{ clipPath }}>
      <motion.div className="mosaic__img" style={{ scale }}>
        <Image
          src={src}
          alt=""
          fill
          className="img-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </motion.div>
    </motion.div>
  );
}

function AboutStage({
  block,
  index,
  progress,
}: {
  block: HomeAboutBlock;
  index: number;
  progress: MotionValue<number>;
}) {
  const reverse = index % 2 === 1;
  const copyOpacity = useTransform(progress, COPY_RANGE, [0, 1]);
  const copyX = useTransform(
    progress,
    COPY_RANGE,
    [reverse ? "-12%" : "12%", "0%"],
  );
  const rowOffsets = block.imageRows.map((_, r) =>
    block.imageRows.slice(0, r).reduce((n, row) => n + row.length, 0),
  );

  return (
    <div
      className={
        reverse ? "about-stage about-stage--reverse grid-12" : "about-stage grid-12"
      }
    >
      <div className="about-stage__media mosaic" aria-hidden="true">
        {block.imageRows.map((row, rowIndex) => (
          <div key={rowIndex} className="mosaic__row">
            {row.map((src, cellIndex) => (
              <MosaicCell
                key={src}
                src={src}
                order={rowOffsets[rowIndex] + cellIndex}
                progress={progress}
              />
            ))}
          </div>
        ))}
      </div>
      <motion.div
        className="about-stage__copy"
        style={{ opacity: copyOpacity, x: copyX }}
      >
        <p className="about-stage__index" aria-hidden>
          {pad(index + 1)}
        </p>
        <h3 className="about-stage__title">{block.title}</h3>
        <p className="about-stage__body">{block.body}</p>
      </motion.div>
    </div>
  );
}

export function AboutScene({
  block,
  index,
}: {
  block: HomeAboutBlock;
  index: number;
}) {
  return (
    <ScrollScene steps={2} className="about-scene">
      {(progress) => (
        <AboutStage block={block} index={index} progress={progress} />
      )}
    </ScrollScene>
  );
}
