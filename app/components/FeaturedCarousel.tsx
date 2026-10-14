"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { Project } from "@/lib/projects";

const INTERVAL_MS = 6000;
const SWIPE_PX = 48;
const FADE_S = 0.2;
const IMAGE_SIZES = "(max-width: 768px) 100vw, 660px";

const pad = (n: number) => String(n).padStart(2, "0");

export function FeaturedCarousel({
  projects,
  seeAllLabel,
}: {
  projects: readonly Project[];
  seeAllLabel: string;
}) {
  const reduced = useReducedMotion();
  const count = projects.length;
  const [index, setIndex] = useState(0);
  // null = follow the motion preference; otherwise the user's explicit choice.
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const swipeStart = useRef<number | null>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const refocusLink = useRef(false);

  const playing = userPlaying ?? !reduced;
  const running = playing && !hovered && !focused && !hidden && count > 1;

  const go = useCallback(
    (to: number) => setIndex(((to % count) + count) % count),
    [count],
  );

  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // Restarts on every slide change, so manual navigation resets the clock.
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => go(index + 1), INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [running, index, go]);

  if (count === 0) return null;

  const project = projects[index];
  const next = projects[(index + 1) % count];

  return (
    <section
      className="carousel"
      aria-roledescription="carousel"
      aria-label="Featured projects"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(e) => {
        // The focused slide link unmounts on change; hand focus to the next one.
        refocusLink.current = e.target === linkRef.current;
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(index + 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(index - 1);
        }
      }}
    >
      <div
        className="carousel__viewport"
        aria-live={playing ? "off" : "polite"}
        aria-atomic="true"
        onPointerDown={(e) => {
          swipeStart.current = e.pointerType === "mouse" ? null : e.clientX;
        }}
        onPointerUp={(e) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (start === null) return;
          const dx = e.clientX - start;
          if (Math.abs(dx) > SWIPE_PX) go(index + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={project.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : FADE_S, ease: [0.2, 0, 0, 1] }}
            onAnimationComplete={(def) => {
              // Ignore the exit animation of the outgoing slide.
              if (typeof def !== "object" || !("opacity" in def) || def.opacity !== 1)
                return;
              if (refocusLink.current) linkRef.current?.focus();
              refocusLink.current = false;
            }}
          >
            <Link
              ref={linkRef}
              href={`/projects/${project.id}`}
              aria-label={`${project.title} — open case study`}
              className="carousel__slide grid-12"
              draggable={false}
            >
              <div className="carousel__media">
                <Image
                  src={project.imageUrl}
                  alt=""
                  fill
                  className="img-cover"
                  sizes={IMAGE_SIZES}
                  loading="eager"
                  draggable={false}
                />
              </div>
              <div className="carousel__body">
                <p className="eyebrow">
                  Featured · {pad(index + 1)} / {pad(count)}
                </p>
                <h3 className="carousel__title">{project.title}</h3>
                <p className="carousel__desc">{project.description}</p>
                <ul className="tag-list">
                  {project.tags.map((tag) => (
                    <li key={tag} className="tag">
                      {tag}
                    </li>
                  ))}
                </ul>
                <span className="carousel__cta text-link">
                  Open case study →
                </span>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 ? (
        <div className="carousel__preload" aria-hidden>
          <Image
            src={next.imageUrl}
            alt=""
            fill
            sizes={IMAGE_SIZES}
            loading="eager"
          />
        </div>
      ) : null}

      <div className="carousel__controls">
        <div className="carousel__buttons">
          <button
            type="button"
            className="icon-btn"
            aria-label="Previous project"
            onClick={() => go(index - 1)}
          >
            <ChevronLeft aria-hidden />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Next project"
            onClick={() => go(index + 1)}
          >
            <ChevronRight aria-hidden />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={playing ? "Pause rotation" : "Start rotation"}
            onClick={() => setUserPlaying(!playing)}
          >
            {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
          </button>
          <span className="carousel__position" aria-hidden>
            {pad(index + 1)} / {pad(count)}
          </span>
        </div>

        <div className="carousel__dashes">
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className="carousel__dash"
              aria-label={`Show ${p.title}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>

        <Link href="/projects" className="btn btn--ghost carousel__all">
          {seeAllLabel}
          <ArrowRight aria-hidden />
        </Link>
      </div>
    </section>
  );
}
