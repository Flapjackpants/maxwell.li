"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import {
  homeAboutBlocks,
  homeAboutSection,
  homeCv,
  homeFooter,
  homeHero,
  homeProjectsIntro,
  navLinks,
  PROFILE_IMAGE_URL,
} from "@/lib/home-content";
import { PROJECTS } from "@/lib/projects";
import { PortfolioBackground } from "./components/PortfolioBackground";

const MotionProjectLink = motion(Link);

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Home() {
  return (
    <div className="page-root home-root">
      <PortfolioBackground />
      <div className="page-layer">
        <header className="projects-archive-header">
          <a href="#bio" className="home-nav-brand">
            Home
          </a>
          <nav aria-label="Primary">
            <ul className="home-header-nav">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="home-nav-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="home-main">
          <section
            id="bio"
            className="home-section home-section--hero"
          >
            <div className="home-inner home-inner--hero">
              <motion.div {...fadeUp} className="home-hero-split">
                <div className="home-portrait home-portrait--hero">
                  <Image
                    src={PROFILE_IMAGE_URL}
                    alt="Profile"
                    fill
                    className="img-cover"
                    sizes="(max-width: 640px) 88vw, (max-width: 1024px) 42vw, 480px"
                    priority
                  />
                </div>
                <div className="home-hero-copy">
                  <p className="mono-data home-hero-eyebrow">
                    {homeHero.eyebrow}
                  </p>
                  <h1 className="home-hero-title">{homeHero.title}</h1>
                  <p className="home-lede home-lede--hero">{homeHero.lede}</p>
                  <div className="home-cta-row home-cta-row--hero">
                    <a href="#cv" className="btn btn--primary">
                      <FileText aria-hidden />
                      View CV
                    </a>
                    <a
                      href="https://github.com/Flapjackpants"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--ghost"
                    >
                      <Github aria-hidden />
                      GitHub
                      <ArrowRight className="btn-icon-fade" aria-hidden />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section id="about" className="home-section home-section--about">
            <div className="home-inner">
              <motion.div {...fadeUp} className="home-about-section-intro">
                <p className="mono-data home-about-eyebrow">
                  {homeAboutSection.eyebrow}
                </p>
                <h2 className="home-section-heading home-about-heading">
                  {homeAboutSection.heading}
                </h2>
              </motion.div>

              <div className="home-about-blocks">
                {homeAboutBlocks.map((block, index) => (
                  <div
                    key={block.title}
                    className={
                      index % 2 === 1
                        ? "home-about-block home-about-block--reverse"
                        : "home-about-block"
                    }
                  >
                    <motion.div {...fadeUp} className="home-about-split">
                      <div
                        className="home-about-collage-wrap"
                        aria-hidden="true"
                      >
                        <div className="home-about-collage-grid">
                          {block.imageRows.map((row, rowIndex) => (
                            <div
                              key={rowIndex}
                              className="home-about-collage-row"
                              style={
                                {
                                  "--about-row-n": row.length,
                                } as React.CSSProperties
                              }
                            >
                              {row.map((src, cellIndex) => (
                                // Natural dimensions + max-* caps for variable-aspect mosaic (Next/Image fill always uses a box).
                                // eslint-disable-next-line @next/next/no-img-element -- see above
                                <img
                                  key={`${rowIndex}-${cellIndex}-${src}`}
                                  src={src}
                                  alt=""
                                  className="home-about-collage-img"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="home-about-copy">
                        <h3 className="home-about-subheading">{block.title}</h3>
                        <p className="home-about-body">{block.body}</p>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="projects" className="home-section">
            <div className="home-inner">
              <motion.div {...fadeUp} className="home-intro-block">
                <h2 className="home-section-heading">
                  {homeProjectsIntro.heading}
                </h2>
                <p className="home-section-intro">{homeProjectsIntro.intro}</p>
              </motion.div>

              <div className="home-project-grid">
                {PROJECTS.map((project, index) => (
                  <MotionProjectLink
                    key={project.id}
                    href={`/projects/${project.id}`}
                    aria-label={`${project.title} — open case study`}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10% 0px" }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.06,
                      ease: [0.22, 1, 0.36, 1] as const,
                    }}
                    className="home-project-card"
                  >
                    <div className="home-project-card-media">
                      <Image
                        src={project.imageUrl}
                        alt=""
                        fill
                        className="img-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                      />
                    </div>
                    <div className="home-project-card-body">
                      <h3 className="home-project-card-title">
                        {project.title}
                      </h3>
                      <p className="home-project-card-desc">
                        {project.description}
                      </p>
                      <ul className="tag-list">
                        {project.tags.map((tag) => (
                          <li key={tag} className="tag mono-data">
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </MotionProjectLink>
                ))}
              </div>
            </div>
          </section>

          <section id="cv" className="home-section">
            <div className="home-inner">
              <motion.div {...fadeUp} className="home-cv-panel">
                <div>
                  <h2 className="home-section-heading">{homeCv.heading}</h2>
                  <p className="home-cv-lede">{homeCv.lede}</p>
                </div>
                <a href={homeCv.pdfHref} className="btn btn--download">
                  <FileText aria-hidden />
                  Download
                </a>
              </motion.div>
            </div>
          </section>
        </main>

        <footer id="socials" className="home-footer-outer">
          <div className="home-inner">
            <motion.div {...fadeUp} className="home-footer-rule">
              <div className="home-footer-row">
                <div>
                  <p className="mono-data home-footer-label">
                    {homeFooter.connectLabel}
                  </p>
                  <p className="home-footer-copy">{homeFooter.copy}</p>
                </div>
                <ul className="home-social-list">
                  <li>
                    <a
                      href={homeFooter.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="home-social-link"
                      aria-label="LinkedIn"
                    >
                      <Linkedin />
                    </a>
                  </li>
                  <li>
                    <a
                      href={homeFooter.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="home-social-link"
                      aria-label="GitHub"
                    >
                      <Github />
                    </a>
                  </li>
                  <li>
                    <a
                      href={homeFooter.mailHref}
                      className="home-social-link"
                      aria-label="Email"
                    >
                      <Mail />
                    </a>
                  </li>
                </ul>
              </div>
              <p className="home-copyright mono-data">
                © {new Date().getFullYear()} — All rights reserved
              </p>
            </motion.div>
          </div>
        </footer>

        <Link
          href="/retro"
          prefetch={false}
          className="home-retro-easter-egg"
          aria-label="Open Y2K-style alternate homepage"
        />
      </div>
    </div>
  );
}
