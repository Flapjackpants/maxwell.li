"use client";

import { MotionConfig, motion } from "framer-motion";
import Link from "next/link";
import { ArrowDown, ArrowRight, FileText, Github, Linkedin, Mail } from "lucide-react";
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
import { getPinnedProjects } from "@/lib/projects";
import { FeaturedCarousel } from "./components/FeaturedCarousel";
import { AboutScene, HeroScene } from "./components/HomeScenes";
import { PortfolioBackground } from "./components/PortfolioBackground";
import { SectionRail, useActiveSection } from "./components/SectionRail";

const pinnedProjects = getPinnedProjects();
const sectionIds = navLinks.map((link) => link.href.slice(1));
const railLinks = navLinks.filter((link) => link.href !== "#socials");

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
  transition: { duration: 0.4, ease: [0.2, 0, 0, 1] as const },
};

export default function Home() {
  const activeSection = useActiveSection(sectionIds);

  return (
    <MotionConfig reducedMotion="user">
      <div className="page-root site-root">
        <PortfolioBackground />
        <div className="page-layer">
          <header className="site-header">
            <div className="site-header__inner">
              <a href="#bio" className="site-brand">
                Home
              </a>
              <nav aria-label="Primary" className="site-nav">
                <ul>
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        aria-current={
                          link.href.slice(1) === activeSection
                            ? "true"
                            : undefined
                        }
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </header>

          <SectionRail items={railLinks} active={activeSection} />

          <main>
            <section id="bio" className="hero">
              <div className="section__inner">
                <motion.div {...fadeUp}>
                  <HeroScene imageUrl={PROFILE_IMAGE_URL}>
                    <p className="eyebrow">{homeHero.eyebrow}</p>
                    <h1 className="hero__name">{homeHero.title}</h1>
                    <p className="hero__lede">{homeHero.lede}</p>
                    <div className="hero__cta">
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
                        <ArrowRight aria-hidden />
                      </a>
                    </div>
                  </HeroScene>
                </motion.div>
              </div>
              <a href="#about" className="hero__cue eyebrow">
                Scroll
                <ArrowDown aria-hidden />
              </a>
            </section>

            <section id="about" className="section">
              <div className="section__inner">
                <motion.div {...fadeUp} className="section__head grid-12">
                  <div>
                    <p className="eyebrow">{homeAboutSection.eyebrow}</p>
                    <h2 className="section__title">
                      {homeAboutSection.heading}
                    </h2>
                  </div>
                </motion.div>

                {homeAboutBlocks.map((block, index) => (
                  <AboutScene key={block.title} block={block} index={index} />
                ))}
              </div>
            </section>

            <section id="projects" className="section">
              <div className="section__inner">
                <motion.div {...fadeUp} className="section__head grid-12">
                  <h2 className="section__title">
                    {homeProjectsIntro.heading}
                  </h2>
                  <p className="section__intro">{homeProjectsIntro.intro}</p>
                </motion.div>

                <FeaturedCarousel
                  projects={pinnedProjects}
                  seeAllLabel={homeProjectsIntro.listAllLabel}
                />
              </div>
            </section>

            <section id="cv" className="section">
              <div className="section__inner">
                <motion.div {...fadeUp} className="cv-row">
                  <div>
                    <h2 className="cv-row__heading">{homeCv.heading}</h2>
                    <p className="cv-row__lede">{homeCv.lede}</p>
                  </div>
                  <a href={homeCv.pdfHref} className="btn btn--primary">
                    <FileText aria-hidden />
                    Download
                  </a>
                </motion.div>
              </div>
            </section>
          </main>

          <footer id="socials" className="site-footer">
            <div className="section__inner">
              <motion.div {...fadeUp}>
                <div className="site-footer__row">
                  <div>
                    <p className="eyebrow">{homeFooter.connectLabel}</p>
                    <p className="site-footer__copy">{homeFooter.copy}</p>
                  </div>
                  <ul className="site-footer__social">
                    <li>
                      <a
                        href={homeFooter.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="site-footer__link"
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
                        className="site-footer__link"
                        aria-label="GitHub"
                      >
                        <Github />
                      </a>
                    </li>
                    <li>
                      <a
                        href={homeFooter.mailHref}
                        className="site-footer__link"
                        aria-label="Email"
                      >
                        <Mail />
                      </a>
                    </li>
                  </ul>
                </div>
                <p className="eyebrow site-footer__legal">
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
    </MotionConfig>
  );
}
