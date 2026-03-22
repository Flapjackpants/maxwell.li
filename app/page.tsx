"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  FileText,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";

/** Swap for `/profile.jpg` (file in `public/`) or any allowed image URL. */
const PROFILE_IMAGE_URL = "https://via.placeholder.com/320x320";

const PROJECTS = [
  {
    id: "alpha",
    title: "Distributed Telemetry Core",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    imageUrl: "https://via.placeholder.com/600x400",
    githubUrl: "https://github.com",
    tags: ["TypeScript", "Rust", "gRPC", "Kafka"],
  },
  {
    id: "bravo",
    title: "Operational Graph Studio",
    description:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute.",
    imageUrl: "https://via.placeholder.com/600x400",
    githubUrl: "https://github.com",
    tags: ["React", "D3", "PostgreSQL", "Next.js"],
  },
  {
    id: "charlie",
    title: "Secure Ingest Pipeline",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint.",
    imageUrl: "https://via.placeholder.com/600x400",
    githubUrl: "https://github.com",
    tags: ["Go", "AWS", "Terraform", "OpenTelemetry"],
  },
  {
    id: "delta",
    title: "Mission Control Dashboard",
    description:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum sed ut.",
    imageUrl: "https://via.placeholder.com/600x400",
    githubUrl: "https://github.com",
    tags: ["Python", "FastAPI", "Redis", "WebSockets"],
  },
] as const;

const navLinks = [
  { href: "#bio", label: "Bio" },
  { href: "#projects", label: "Projects" },
  { href: "#cv", label: "CV" },
  { href: "#socials", label: "Socials" },
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/90 backdrop-blur-md transition-colors">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <a
            href="#bio"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-100 transition hover:text-white"
          >
            Index
          </a>
          <ul className="flex flex-wrap items-center justify-end gap-1 sm:gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="px-2 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400 transition hover:text-white sm:text-xs"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main>
        <section
          id="bio"
          className="border-b border-neutral-800 px-5 py-20 md:px-8 md:py-28 lg:py-32"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp}>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8 md:gap-10">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden border border-neutral-800 bg-neutral-950 sm:h-28 sm:w-28 md:h-32 md:w-32">
                  <Image
                    src={PROFILE_IMAGE_URL}
                    alt="Profile"
                    fill
                    className="object-cover"
                    sizes="128px"
                    priority
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-neutral-500">
                    Systems · Software · Strategy
                  </p>
                  <h1 className="max-w-4xl text-3xl font-bold uppercase leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                    Engineering the future
                  </h1>
                </div>
              </div>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                posuere erat a ante venenatis dapibus posuere velit aliquet.
                Cras mattis consectetur purus sit amet fermentum. Curabitur
                blandit tempus porttitor.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#cv"
                  className="inline-flex items-center justify-center gap-2 border border-neutral-700 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:border-white hover:bg-neutral-200"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  View CV
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-neutral-700 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-950"
                >
                  <Github className="h-4 w-4" aria-hidden />
                  GitHub
                  <ArrowRight className="h-4 w-4 opacity-70" aria-hidden />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="projects"
          className="border-b border-neutral-800 px-5 py-20 md:px-8 md:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp} className="mb-12 md:mb-16">
              <h2 className="text-xs font-bold uppercase tracking-[0.35em] text-white">
                Selected work
              </h2>
              <p className="mt-3 max-w-xl text-sm text-neutral-500">
                Lorem ipsum dolor sit amet — deployments, interfaces, and
                infrastructure at scale.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
              {PROJECTS.map((project, index) => (
                <motion.a
                  key={project.id}
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} — open on GitHub`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.06,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                  className="group flex flex-col border border-neutral-800 bg-neutral-950/40 text-left transition-colors hover:border-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <div className="relative aspect-[3/2] w-full overflow-hidden border-b border-neutral-800">
                    <Image
                      src={project.imageUrl}
                      alt=""
                      fill
                      className="object-cover transition duration-500 group-hover:opacity-95"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                      {project.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-400">
                      {project.description}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <li
                          key={tag}
                          className="border border-neutral-800 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-neutral-400"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        <section
          id="cv"
          className="border-b border-neutral-800 px-5 py-20 md:px-8 md:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div
              {...fadeUp}
              className="grid gap-10 border border-neutral-800 bg-neutral-950/30 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10 lg:p-12"
            >
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.35em] text-white">
                  Curriculum vitae
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400 md:text-base">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
                  lacinia bibendum nulla sed consectetur. Maecenas faucibus
                  mollis interdum. Vestibulum id ligula porta felis euismod
                  semper.
                </p>
              </div>
              <a
                href="/cv.pdf"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 self-start border border-neutral-700 px-8 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-neutral-900 md:self-center"
              >
                <FileText className="h-4 w-4" aria-hidden />
                Download
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <footer
        id="socials"
        className="px-5 py-16 md:px-8 md:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            {...fadeUp}
            className="flex flex-col gap-8 border-t border-neutral-800 pt-10 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                Connect
              </p>
              <p className="mt-2 text-sm text-neutral-400">
                Lorem ipsum — open to aligned missions and rigorous teams.
              </p>
            </div>
            <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center border border-neutral-800 text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center border border-neutral-800 text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@example.com"
                  className="flex h-11 w-11 items-center justify-center border border-neutral-800 text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </li>
            </ul>
          </motion.div>
          <p className="mt-10 text-center text-[10px] uppercase tracking-[0.25em] text-neutral-600">
            © {new Date().getFullYear()} — All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
