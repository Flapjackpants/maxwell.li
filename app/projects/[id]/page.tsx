import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Github } from "lucide-react";
import {
  getAllProjectIds,
  getProjectById,
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

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  const idx = PROJECTS.findIndex((p) => p.id === id);
  const prev = idx > 0 ? PROJECTS[idx - 1] : null;
  const next = idx < PROJECTS.length - 1 ? PROJECTS[idx + 1] : null;

  return (
    <article className="project-detail">
      <Link href="/projects" className="project-detail-back mono-data">
        <ArrowLeft className="project-detail-back-icon" aria-hidden />
        All projects
      </Link>

      <div className="project-detail-hero">
        <div className="project-detail-media">
          <Image
            src={project.imageUrl}
            alt=""
            fill
            priority
            className="img-cover"
            sizes="100vw"
          />
        </div>
        <div className="project-detail-hero-copy">
          <p className="mono-data">CASE_STUDY // {project.id.toUpperCase()}</p>
          <h1 className="project-detail-title">{project.title}</h1>
          <ul className="tag-list project-detail-tags">
            {project.tags.map((tag) => (
              <li key={tag} className="tag mono-data">
                {tag}
              </li>
            ))}
          </ul>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost project-detail-github"
          >
            <Github aria-hidden />
            Repository
          </a>
        </div>
      </div>

      <div className="project-detail-body">
        {project.detail.split("\n\n").map((para, i) => (
          <p key={i} className="project-detail-para">
            {para}
          </p>
        ))}
      </div>

      <nav className="project-detail-nav" aria-label="Adjacent projects">
        {prev ? (
          <Link href={`/projects/${prev.id}`} className="project-detail-nav-link">
            <span className="mono-data">Prev</span>
            <span className="project-detail-nav-title">{prev.title}</span>
          </Link>
        ) : (
          <span className="project-detail-nav-spacer" aria-hidden />
        )}
        {next ? (
          <Link
            href={`/projects/${next.id}`}
            className="project-detail-nav-link project-detail-nav-link--next"
          >
            <span className="mono-data">Next</span>
            <span className="project-detail-nav-title">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
