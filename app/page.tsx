"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const MotionProjectLink = motion(Link);
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type MouseEvent,
} from "react";
import { PROJECTS, type Project, type ProjectId } from "@/lib/projects";

/** Subset of `PROJECTS` shown on the home “Selected work” rail (order preserved). */
const HOME_RAIL_PROJECT_IDS = ["alpha", "bravo", "charlie"] as const satisfies readonly ProjectId[];

const homeRailProjects: readonly Project[] = HOME_RAIL_PROJECT_IDS.map((id) => {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) {
    throw new Error(`HOME_RAIL_PROJECT_IDS: unknown id "${id}"`);
  }
  return p;
});
import { PortfolioBackground } from "./components/PortfolioBackground";
import {
  ArrowRight,
  FileText,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";

/** Swap for `/profile.jpg` (file in `public/`) or any allowed image URL. */
const PROFILE_IMAGE_URL = "https://via.placeholder.com/640x640";

const navLinks = [
  { id: "bio", label: "Bio" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "CV & connect" },
] as const;

const viewportSnap = {
  amount: 0.38,
  margin: "-8% 0px -8% 0px" as const,
  once: false,
};

const snapEase = [0.22, 1, 0.36, 1] as const;

const revealContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const revealItem = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: snapEase },
  },
};

const railRevealContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.085, delayChildren: 0.14 },
  },
};

const railRevealItem = {
  hidden: { opacity: 0, y: 26, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.52, ease: snapEase },
  },
};

const SECTION_COUNT = 3;

/** Normalized wheel delta (px-ish); line/page modes differ on mouse vs trackpad. */
function wheelDeltaYPixels(e: WheelEvent, lineHeightPx: number) {
  if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) return e.deltaY * lineHeightPx;
  if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE)
    return e.deltaY * lineHeightPx * 12;
  return e.deltaY;
}

function clampSlideIndex(outer: HTMLElement, raw: number) {
  return Math.max(0, Math.min(SECTION_COUNT - 1, Math.round(raw)));
}

/**
 * Distance from the top of `scroller`'s scrollable content to `el`'s top border.
 * `offsetTop` alone is wrong when `offsetParent` is not the scroll container (flex/stacking contexts).
 */
function elementContentOffsetTop(el: HTMLElement, scroller: HTMLElement): number {
  const sr = scroller.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  return scroller.scrollTop + (er.top - sr.top);
}

function getSectionScrollTops(
  scroller: HTMLElement,
): [number, number, number] | null {
  const bio = document.getElementById("bio");
  const projects = document.getElementById("projects");
  const contact = document.getElementById("contact");
  if (!bio || !projects || !contact) return null;
  return [
    elementContentOffsetTop(bio, scroller),
    elementContentOffsetTop(projects, scroller),
    elementContentOffsetTop(contact, scroller),
  ];
}

function projectsRailExtraPx(el: HTMLElement | null) {
  if (!el) return 0;
  const raw = getComputedStyle(el).getPropertyValue("--projects-rail-extra").trim();
  if (!raw) return 0;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function applyProjectsRailShift(
  outer: HTMLElement,
  projectsEl: HTMLElement,
  port: HTMLElement,
  rail: HTMLElement,
  shift: HTMLElement,
) {
  const t1 = elementContentOffsetTop(projectsEl, outer);
  const R = projectsRailExtraPx(projectsEl);
  const y = outer.scrollTop;
  const local = y - t1;
  let t = 0;
  if (R > 0 && local > 0) {
    t = Math.min(1, Math.max(0, local / R));
  }
  const maxX = Math.max(0, rail.scrollWidth - port.clientWidth);
  shift.style.transform = `translate3d(${-t * maxX}px, 0, 0)`;
}

function nearestSlideScrollTop(outer: HTMLElement) {
  const tops = getSectionScrollTops(outer);
  if (!tops) return 0;
  const [t0, t1, t2] = tops;
  const projects = document.getElementById("projects");
  if (!projects) return outer.scrollTop;
  const R = projectsRailExtraPx(projects);
  const railEnd = t1 + R;
  const y = outer.scrollTop;

  // Inside the projects rail scrub range, keep scrollTop as-is so the horizontal
  // index matches vertical progress (bisecting to t1/railEnd broke scrubbing and
  // felt like "snap back to first card", especially when scroll-end correction runs).
  if (R > 0 && y > t1 && y < railEnd) {
    return y;
  }
  if (y >= railEnd && y < t2) {
    return y < (railEnd + t2) * 0.5 ? railEnd : t2;
  }

  const candidates = [t0, t1, t2];
  let best = candidates[0];
  let bestD = Math.abs(y - best);
  for (let i = 1; i < candidates.length; i++) {
    const d = Math.abs(y - candidates[i]);
    if (d < bestD) {
      best = candidates[i];
      bestD = d;
    }
  }
  return best;
}

function goToSlideIndex(
  outer: HTMLElement,
  index: number,
  behavior: ScrollBehavior = "auto",
) {
  const tops = getSectionScrollTops(outer);
  if (!tops) return;
  const idx = clampSlideIndex(outer, index);
  outer.scrollTo({ top: tops[idx], behavior });
}

/** Which snap slide owns the viewport center (Firefox-safe vs scrollTop / clientHeight rounding). */
function activeSlideIndexForWheel(outer: HTMLElement) {
  const outerRect = outer.getBoundingClientRect();
  const cy = outerRect.top + outerRect.height / 2;
  const ids = ["bio", "projects", "contact"] as const;
  for (let i = 0; i < ids.length; i++) {
    const el = document.getElementById(ids[i]);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (cy >= r.top - 1 && cy <= r.bottom + 1) {
      return i;
    }
  }
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < ids.length; i++) {
    const el = document.getElementById(ids[i]);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const mid = (r.top + r.bottom) / 2;
    const dist = Math.abs(cy - mid);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return clampSlideIndex(outer, bestIdx);
}

export default function Home() {
  const snapViewportRef = useRef<HTMLDivElement>(null);
  const projectsScrollRef = useRef<HTMLDivElement>(null);
  const projectsRailRef = useRef<HTMLDivElement>(null);
  const projectsRailShiftRef = useRef<HTMLDivElement>(null);
  const skipSnapCorrectUntilRef = useRef(0);

  useLayoutEffect(() => {
    const root = snapViewportRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;

    const apply = () => {
      const h = root.clientHeight;
      if (h > 0) {
        root.style.setProperty("--snap-slide-px", `${h}px`);
      }
    };

    apply();
    queueMicrotask(apply);
    requestAnimationFrame(() => {
      apply();
      requestAnimationFrame(apply);
    });
    const ro = new ResizeObserver(apply);
    ro.observe(root);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  useEffect(() => {
    const outer = snapViewportRef.current;
    if (!outer) return;

    const WHEEL_THRESHOLD = 56;
    const LINE_HEIGHT = 18;
    const SMOOTH_SCROLL_GUARD_MS = 720;

    let accumY = 0;
    let accumReset: ReturnType<typeof setTimeout> | undefined;

    const scheduleAccumReset = () => {
      clearTimeout(accumReset);
      accumReset = setTimeout(() => {
        accumY = 0;
      }, 140);
    };

    const slideAfterWheel = (nextIdx: number) => {
      skipSnapCorrectUntilRef.current = performance.now() + SMOOTH_SCROLL_GUARD_MS;
      goToSlideIndex(outer, nextIdx, "smooth");
      accumY = 0;
    };

    const sectionScrollState = (el: HTMLElement | null) => {
      if (!el) return { canScroll: false, atTop: true, atBottom: true };
      const { scrollTop, scrollHeight, clientHeight } = el;
      const canScroll = scrollHeight > clientHeight + 2;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 2;
      return { canScroll, atTop, atBottom };
    };

    const onWheel = (e: WheelEvent) => {
      const tops = getSectionScrollTops(outer);
      const dy = wheelDeltaYPixels(e, LINE_HEIGHT);
      const dx = e.deltaX;

      // Projects corridor: drive scroll ourselves. Native wheel + scroll-snap on the
      // viewport often fights discrete mouse-wheel steps on macOS (feels “stuck”).
      // Lower bound stays near t1 only (not t1−N) so we don’t steal wheel from bio.
      if (tops && Math.abs(dy) >= Math.abs(dx)) {
        const [, t1, t2] = tops;
        const y = outer.scrollTop;
        const maxY = Math.max(0, outer.scrollHeight - outer.clientHeight);
        if (y >= t1 - 2 && y < t2) {
          e.preventDefault();
          outer.scrollTop = Math.min(maxY, Math.max(0, y + dy));
          return;
        }
      }

      const idx = activeSlideIndexForWheel(outer);
      if (idx !== 1 && Math.abs(dx) > Math.abs(dy) * 1.2) return;

      // Bio / contact: same pattern when slide content overflows (small viewports).
      if (idx === 0) {
        const bio = document.getElementById("bio");
        const { canScroll, atTop, atBottom } = sectionScrollState(bio);
        if (canScroll) {
          const innerWantsWheel =
            (dy > 0 && !atBottom) || (dy < 0 && !atTop);
          if (innerWantsWheel) return;
        }
      } else if (idx === 2) {
        const contact = document.getElementById("contact");
        const { canScroll, atTop, atBottom } = sectionScrollState(contact);
        if (canScroll) {
          const innerWantsWheel =
            (dy > 0 && !atBottom) || (dy < 0 && !atTop);
          if (innerWantsWheel) return;
        }
      }

      e.preventDefault();
      accumY += dy;
      scheduleAccumReset();

      if (accumY >= WHEEL_THRESHOLD) {
        slideAfterWheel(idx + 1);
      } else if (accumY <= -WHEEL_THRESHOLD) {
        slideAfterWheel(idx - 1);
      }
    };

    outer.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => {
      outer.removeEventListener("wheel", onWheel, { capture: true });
      clearTimeout(accumReset);
    };
  }, []);

  useEffect(() => {
    const port = projectsScrollRef.current;
    const rail = projectsRailRef.current;
    const projects = document.getElementById("projects");
    if (!port || !rail || !projects || typeof ResizeObserver === "undefined")
      return;

    const applyExtraAndShift = () => {
      const maxX = Math.max(0, rail.scrollWidth - port.clientWidth);
      projects.style.setProperty("--projects-rail-extra", `${maxX}px`);
      const root = snapViewportRef.current;
      const shift = projectsRailShiftRef.current;
      if (root && shift) {
        applyProjectsRailShift(root, projects, port, rail, shift);
      }
    };

    const ro = new ResizeObserver(applyExtraAndShift);
    ro.observe(port);
    ro.observe(rail);
    applyExtraAndShift();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const root = snapViewportRef.current;
    if (!root) return;

    const SNAP_EPS = 4;

    const syncRail = () => {
      const projects = document.getElementById("projects");
      const port = projectsScrollRef.current;
      const rail = projectsRailRef.current;
      const shift = projectsRailShiftRef.current;
      if (projects && port && rail && shift) {
        applyProjectsRailShift(root, projects, port, rail, shift);
      }
    };

    const correctToNearestSlide = () => {
      if (performance.now() < skipSnapCorrectUntilRef.current) return;
      const target = nearestSlideScrollTop(root);
      if (Math.abs(root.scrollTop - target) > SNAP_EPS) {
        root.scrollTo({ top: target, behavior: "auto" });
      }
    };

    let debounce: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      syncRail();
      if (performance.now() < skipSnapCorrectUntilRef.current) return;
      clearTimeout(debounce);
      debounce = setTimeout(correctToNearestSlide, 140);
    };

    const onScrollEnd = () => {
      syncRail();
      correctToNearestSlide();
    };

    syncRail();
    root.addEventListener("scrollend", onScrollEnd);
    root.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      root.removeEventListener("scrollend", onScrollEnd);
      root.removeEventListener("scroll", onScroll);
      clearTimeout(debounce);
    };
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const root = snapViewportRef.current;
    const el = document.getElementById(id);
    if (!root || !el) return;
    const top = elementContentOffsetTop(el as HTMLElement, root);
    skipSnapCorrectUntilRef.current = performance.now() + 700;
    root.scrollTo({ top, behavior: "smooth" });
  }, []);

  const onNavClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      scrollToSection(id);
    },
    [scrollToSection],
  );

  return (
    <div className="page-root page-root--snap">
      <PortfolioBackground />
      <div className="page-layer">
        <header className="site-header">
          <nav className="nav-inner">
            <a
              href="#bio"
              className="nav-brand"
              onClick={(e) => onNavClick(e, "bio")}
            >
              Index
            </a>
            <ul className="nav-links">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className="nav-link"
                    onClick={(e) => onNavClick(e, link.id)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <div className="snap-scroll-shell">
          <div
            ref={snapViewportRef}
            className="snap-viewport"
            tabIndex={-1}
            aria-label="Portfolio sections"
          >
          <section id="bio" className="snap-section snap-section--bio">
            <motion.div
              className="hero-snap hero-snap--split"
              variants={revealContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportSnap}
            >
              <motion.div className="hero-snap__portrait" variants={revealItem}>
                <Image
                  src={PROFILE_IMAGE_URL}
                  alt="Profile"
                  fill
                  sizes="(max-width: 767px) 100vw, 320px"
                  className="img-cover"
                  priority
                />
              </motion.div>
              <div className="hero-snap__copy">
                <motion.p
                  className="mono-data hero-snap__eyebrow"
                  variants={revealItem}
                >
                  SECTOR_01 // IDENTITY
                </motion.p>
                <motion.h1
                  className="display-title--hero"
                  variants={revealItem}
                >
                  Maxwell Li
                </motion.h1>
                <motion.p className="lede lede--hero" variants={revealItem}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                  posuere erat a ante venenatis dapibus posuere velit aliquet.
                  Cras mattis consectetur purus sit amet fermentum.
                </motion.p>
                <motion.div
                  className="cta-row cta-row--hero"
                  variants={revealItem}
                >
                  <a
                    href="#contact"
                    className="btn btn--primary"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("contact");
                    }}
                  >
                    <FileText aria-hidden />
                    View CV
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--ghost"
                  >
                    <Github aria-hidden />
                    GitHub
                    <ArrowRight className="btn-icon-fade" aria-hidden />
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </section>

          <section
            id="projects"
            className="snap-section snap-section--projects-rail"
          >
            <div className="projects-snap-sticky">
              <div className="snap-section__inner projects-snap">
                <div className="projects-snap__bundle">
                  <motion.div
                    className="projects-snap__header projects-snap__header-row"
                    variants={revealContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportSnap}
                  >
                    <div className="projects-snap__header-text">
                      <motion.p className="mono-data" variants={revealItem}>
                        MODULE_02 // WORK_INDEX
                      </motion.p>
                      <motion.h2 className="section-heading" variants={revealItem}>
                        Selected work
                      </motion.h2>
                      <motion.p className="section-intro" variants={revealItem}>
                        Lorem ipsum dolor sit amet — deployments, interfaces, and
                        infrastructure at scale. Open the archive for full case
                        studies, or scroll vertically to scrub the work index,
                        then open a project.
                      </motion.p>
                    </div>
                    <motion.div variants={revealItem}>
                      <Link
                        href="/projects"
                        className="btn btn--ghost btn--compact"
                      >
                        Full archive
                        <ArrowRight className="btn-icon-fade" aria-hidden />
                      </Link>
                    </motion.div>
                  </motion.div>

                  <div ref={projectsScrollRef} className="projects-snap-scroll">
                    <div
                      ref={projectsRailShiftRef}
                      className="projects-snap-rail-shift"
                    >
                      <motion.div
                        ref={projectsRailRef}
                        className="projects-snap-rail"
                        variants={railRevealContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                          once: true,
                          amount: 0.12,
                          margin: "0px 0px -8% 0px",
                        }}
                      >
                        {homeRailProjects.map((project) => (
                          <MotionProjectLink
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="project-card project-card--rail"
                            aria-label={`${project.title} — open case study`}
                            variants={railRevealItem}
                          >
                            <div
                              className="project-card--rail-inner"
                              style={{
                                display: "flex",
                                height: "100%",
                                flexDirection: "column",
                              }}
                            >
                              <div className="project-card-media">
                                <Image
                                  src={project.imageUrl}
                                  alt=""
                                  fill
                                  className="img-cover"
                                  sizes="(max-width: 640px) 84vw, 28rem"
                                />
                              </div>
                              <div className="project-card-body">
                                <h3 className="project-title">{project.title}</h3>
                                <p className="project-desc">{project.description}</p>
                                <ul className="tag-list">
                                  {project.tags.map((tag) => (
                                    <li key={tag} className="tag mono-data">
                                      {tag}
                                    </li>
                                  ))}
                                </ul>
                                <p className="project-card-hint mono-data">
                                  CASE_STUDY // OPEN
                                </p>
                              </div>
                            </div>
                          </MotionProjectLink>
                        ))}
                      </motion.div>
                    </div>
                  </div>

                  <div className="projects-snap__meta">
                    <p className="mono-data">
                      SCROLL_AXIS // VERTICAL → INDEX //{" "}
                      {String(homeRailProjects.length).padStart(2, "0")} CARDS //
                      ARCHIVE_LINK
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="projects-rail-scroll-spacer" aria-hidden />
          </section>

          <section
            id="contact"
            className="snap-section snap-section--contact"
          >
            <div className="contact-slide">
              <motion.div
                variants={revealContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewportSnap}
              >
                <motion.div className="cv-panel" variants={revealItem}>
                  <div>
                    <p className="mono-data">MODULE_03 // CV_MANIFEST</p>
                    <h2 className="section-heading">Curriculum vitae</h2>
                    <p className="cv-lede">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Aenean lacinia bibendum nulla sed consectetur. Maecenas
                      faucibus mollis interdum.
                    </p>
                  </div>
                  <a href="/cv.pdf" className="btn btn--download">
                    <FileText aria-hidden />
                    Download
                  </a>
                </motion.div>

                <motion.div
                  className="contact-slide__social"
                  variants={revealItem}
                >
                  <div className="footer-row">
                    <div>
                      <p className="mono-data">MODULE_03B // UPLINK</p>
                      <p className="footer-label">Connect</p>
                      <p className="footer-copy">
                        Lorem ipsum — open to aligned missions and rigorous
                        teams.
                      </p>
                    </div>
                    <ul className="social-list">
                      <li>
                        <a
                          href="https://linkedin.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                          aria-label="LinkedIn"
                        >
                          <Linkedin />
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://github.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                          aria-label="GitHub"
                        >
                          <Github />
                        </a>
                      </li>
                      <li>
                        <a
                          href="mailto:hello@example.com"
                          className="social-link"
                          aria-label="Email"
                        >
                          <Mail />
                        </a>
                      </li>
                    </ul>
                  </div>
                  <p className="copyright mono-data">
                    {`© ${new Date().getFullYear()} // RESERVED`}
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
