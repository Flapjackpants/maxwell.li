"use client";

import { useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";

/** Id of the section crossing the middle of the viewport. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/** Fixed right-edge guide: page progress line plus one stop per section. */
export function SectionRail({
  items,
  active,
}: {
  items: readonly { href: string; label: string }[];
  active: string | null;
}) {
  const { scrollYProgress } = useScroll();

  return (
    <nav className="rail" aria-label="Page sections">
      <div className="rail__line" aria-hidden>
        <motion.div
          className="rail__fill"
          style={{ scaleY: scrollYProgress }}
        />
      </div>
      <ol className="rail__list">
        {items.map((item) => {
          const current = item.href.slice(1) === active;
          return (
            <li key={item.href}>
              <a
                href={item.href}
                className="rail__item"
                aria-current={current ? "true" : undefined}
              >
                <span className="rail__label">{item.label}</span>
                <span className="rail__dot" aria-hidden />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
