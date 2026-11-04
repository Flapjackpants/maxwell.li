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
import { SunMountain, WireCage } from "./VaporArt";
import { ScrollScene, useScrubEnabled } from "./ScrollScene";

const pad = (n: number) => String(n).padStart(2, "0");

/* ─── Hero: large portrait that drifts while the copy lifts away ────────── */
export function HeroScene({
  imageUrl,
  title,
  flankLeft,
  flankRight,
  children,
}: {
  imageUrl: string;
  title: ReactNode;
  flankLeft: ReactNode;
  flankRight: ReactNode;
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
      {title}
      <div className="hero__stage">
        <div className="hero__left">
          <motion.div className="hero__copy hud-panel" style={{ y: copyY, opacity: copyOpacity }}>
            <span className="hud-panel__bar" aria-hidden="true">BIO.TXT</span>
            <div className="hud-panel__body">{children}</div>
          </motion.div>
          <div className="hero__flank-left">{flankLeft}</div>
        </div>
        <div className="hero__specimen">
          <SunMountain className="hero__sun" />
          <WireCage>
            <div className="hero__portrait">
              <motion.div className="hero__portrait-inner" style={{ scale: imageScale, y: imageY }}>
                <Image src={imageUrl} alt="Profile" fill className="img-cover" sizes="(max-width: 1024px) 66vw, 24vw" preload />
              </motion.div>
            </div>
          </WireCage>
        </div>
        <div className="hero__flank-right">{flankRight}</div>
      </div>
    </div>
  );
}

/* ─── About: exploded plates settle while the stage is pinned ──────────── */
const CELL_START = 0.35;
const CELL_STAGGER = 0.04;
const CELL_SPAN = 0.4;
const COPY_RANGE = [0.45, 0.75];

function MosaicCell({
  src,
  order,
  rowIndex,
  cellIndex,
  rowLength,
  progress,
}: {
  src: string;
  order: number;
  rowIndex: number;
  cellIndex: number;
  rowLength: number;
  progress: MotionValue<number>;
}) {
  const start = CELL_START + order * CELL_STAGGER;
  const range = [start, start + CELL_SPAN];
  const rotateX = useTransform(progress, range, [58, 0]);
  const rotateZ = useTransform(progress, range, [-38, 0]);
  const x = useTransform(progress, range, [
    `${((rowLength - 1) / 2 - cellIndex) * 105}%`, "0%",
  ]);
  const y = useTransform(progress, range, [
    `${(rowIndex === 0 ? 45 : -65) + (order - 1.5) * 42}%`, "0%",
  ]);

  return (
    <motion.div className="mosaic__cell" style={{ rotateX, rotateZ, x, y }}>
      <div className="mosaic__img">
        <Image
          src={src}
          alt=""
          fill
          className="img-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
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
                rowIndex={rowIndex}
                cellIndex={cellIndex}
                rowLength={row.length}
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
        <div className="hud-panel">
          <span className="hud-panel__bar" aria-hidden="true">ABOUT_0{index + 1}.TXT</span>
          <div className="hud-panel__body">
            <p className="about-stage__index" aria-hidden>{pad(index + 1)}</p>
            <h3 className="about-stage__title">{block.title}</h3>
            <p className="about-stage__body">{block.body}</p>
          </div>
        </div>
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
