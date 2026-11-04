"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { HUD_NOISE } from "@/lib/hud-content";
import { HudReadout } from "./VaporArt";

const IMAGE_SIZES = "(max-width: 1023px) 100vw, 52vw";
const pad = (n: number) => String(n).padStart(2, "0");

export function ProjectDeck({
  projects,
  seeAllLabel,
}: {
  projects: readonly Project[];
  seeAllLabel: string;
}) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const count = projects.length;
  const project = projects[active];

  useEffect(() => {
    const list = listRef.current;
    const button = list?.children[active]?.querySelector("button");
    if (!list || !button) return;
    const listRect = list.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    list.scrollTo({
      left: list.scrollLeft + buttonRect.left - listRect.left - (list.clientWidth - button.clientWidth) / 2,
      behavior: "smooth",
    });
  }, [active]);

  if (!count) return null;

  const go = (index: number) => setActive((index + count) % count);

  return (
    <section aria-label="Featured projects" className="deck">
      <ol className="deck__list" ref={listRef}>
        {projects.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              aria-current={i === active ? "true" : undefined}
              aria-label={`Show ${item.title}`}
              onClick={() => go(i)}
            >
              <span>{pad(i + 1)}</span>
              <span>{item.id.toUpperCase()}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="deck__screen hud-frame">
        <Link href={`/projects/${project.id}`} aria-label={`${project.title} — open case study`} draggable={false}>
          {projects.map((item, i) => (
            <Image
              key={item.id}
              src={item.imageUrl}
              alt=""
              fill
              className={`img-cover deck__image${i === active ? " deck__image--active" : ""}`}
              sizes={IMAGE_SIZES}
              loading={i < 2 ? "eager" : "lazy"}
              draggable={false}
            />
          ))}
        </Link>
      </div>

      <div className="deck__details">
        <div className="deck__info" aria-live="polite" key={project.id}>
          <p className="eyebrow">{pad(active + 1)} / {pad(count)}</p>
          <h3 className="deck__title">{project.title}</h3>
          <p className="deck__description">{project.description}</p>
          <ul className="tag-list">
            {project.tags.map((tag) => <li key={tag} className="tag">{tag}</li>)}
          </ul>
          <Link href={`/projects/${project.id}`} className="text-link">Open case study →</Link>
        </div>
        <HudReadout className="deck__readout" lines={HUD_NOISE.slice(0, 8)} />
      </div>

      <div className="deck__controls">
        <button type="button" className="icon-btn" aria-label="Previous project" onClick={() => go(active - 1)}>
          <ChevronLeft aria-hidden />
        </button>
        <button type="button" className="icon-btn" aria-label="Next project" onClick={() => go(active + 1)}>
          <ChevronRight aria-hidden />
        </button>
        <span className="deck__counter" aria-hidden="true">{pad(active + 1)} / {pad(count)}</span>
        <Link href="/projects" className="btn btn--ghost deck__all">
          {seeAllLabel}<ArrowRight aria-hidden />
        </Link>
      </div>
    </section>
  );
}
