import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import {
  getAllProjectIds,
  getProjectById,
  getYoutubeVideoId,
  PROJECTS,
} from "@/lib/projects";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return getAllProjectIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) return { title: "Project" };
  return {
    title: `${project.title} — Projects`,
    description: project.description,
  };
}

function LiveLink({
  href,
  className,
}: {
  href: string;
  className: string;
}) {
  const isInternal = href.startsWith("/");
  const content = (
    <>
      <ExternalLink aria-hidden />
      Live site
    </>
  );
  if (isInternal) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {content}
    </a>
  );
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  const idx = PROJECTS.findIndex((p) => p.id === id);
  const prev = idx > 0 ? PROJECTS[idx - 1] : null;
  const next = idx < PROJECTS.length - 1 ? PROJECTS[idx + 1] : null;
  const youtubeId = project.demoYoutubeUrl
    ? getYoutubeVideoId(project.demoYoutubeUrl)
    : null;

  return (
    <article>
      <Link href="/projects" className="detail__back">
        <ArrowLeft aria-hidden />
        All projects
      </Link>

      <header className="detail__head">
        <p className="eyebrow">CASE_STUDY // {project.id.toUpperCase()}</p>
        <h1 className="detail__title">{project.title}</h1>
        <ul className="tag-list">
          {project.tags.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>
        <div className="detail__actions">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost"
          >
            <Github aria-hidden />
            Repository
          </a>
          {project.liveUrl ? (
            <LiveLink href={project.liveUrl} className="btn btn--ghost" />
          ) : null}
        </div>
      </header>

      <div className="detail__hero">
        <Image
          src={project.imageUrl}
          alt=""
          fill
          preload
          className="img-cover"
          sizes="(max-width: 1152px) 100vw, 1152px"
        />
      </div>

      <div className="detail__body grid-12">
        <div className="detail__prose">
          {project.detail.split("\n\n").map((para, i) => (
            <p key={i} className="detail__para">
              {para}
            </p>
          ))}
        </div>
      </div>

      {youtubeId ? (
        <div className="detail__demo">
          <p className="eyebrow detail__demo-label">DEMO</p>
          <div className="detail__demo-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
              title={`${project.title} demo`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      ) : null}

      <nav className="pager" aria-label="Adjacent projects">
        {prev ? (
          <Link href={`/projects/${prev.id}`} className="pager__link">
            <span className="eyebrow">Prev</span>
            <span className="pager__title">{prev.title}</span>
          </Link>
        ) : null}
        {next ? (
          <Link
            href={`/projects/${next.id}`}
            className="pager__link pager__link--next"
          >
            <span className="eyebrow">Next</span>
            <span className="pager__title">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
