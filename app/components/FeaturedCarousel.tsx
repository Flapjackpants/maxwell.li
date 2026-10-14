"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/projects";

const IMAGE_SIZES = "(max-width: 768px) 80vw, 900px";
const EAGER_COUNT = 2;

const pad = (n: number) => String(n).padStart(2, "0");

/*
 * Native scroll-snap carousel. Browsers with ::scroll-button / ::scroll-marker
 * get CSS-generated arrows and markers (see portfolio.css); everyone else gets
 * the React controls below, which CSS hides when the native ones exist.
 */
export function FeaturedCarousel({
  projects,
  seeAllLabel,
}: {
  projects: readonly Project[];
  seeAllLabel: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const count = projects.length;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting)
            setActive(cards.indexOf(entry.target as HTMLElement));
        }
      },
      { root: track, threshold: 0.6 },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [count]);

  const go = (to: number) => {
    const track = trackRef.current;
    const card = track?.children[(to + count) % count] as HTMLElement | undefined;
    if (!track || !card) return;
    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2,
    });
  };

  if (count === 0) return null;

  return (
    <section
      className="carousel"
      aria-roledescription="carousel"
      aria-label="Featured projects"
    >
      <ul ref={trackRef} className="carousel__track">
        {projects.map((project, i) => (
          <li
            key={project.id}
            className="carousel__card"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${project.title}`}
          >
            <Link
              href={`/projects/${project.id}`}
              aria-label={`${project.title} — open case study`}
              className="carousel__link"
              draggable={false}
            >
              <Image
                src={project.imageUrl}
                alt=""
                fill
                className="img-cover carousel__img"
                sizes={IMAGE_SIZES}
                loading={i < EAGER_COUNT ? "eager" : "lazy"}
                draggable={false}
              />
              <div className="carousel__caption">
                <p className="eyebrow">
                  {pad(i + 1)} / {pad(count)}
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
          </li>
        ))}
      </ul>

      <div className="carousel__controls">
        <div className="carousel__fallback carousel__buttons">
          <button
            type="button"
            className="icon-btn"
            aria-label="Previous project"
            onClick={() => go(active - 1)}
          >
            <ChevronLeft aria-hidden />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Next project"
            onClick={() => go(active + 1)}
          >
            <ChevronRight aria-hidden />
          </button>
          <span className="carousel__position" aria-hidden>
            {pad(active + 1)} / {pad(count)}
          </span>
        </div>

        <div className="carousel__fallback carousel__dashes">
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className="carousel__dash"
              aria-label={`Show ${p.title}`}
              aria-current={i === active ? "true" : undefined}
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
