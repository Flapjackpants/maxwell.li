import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getArchiveProjects, isProjectPinned } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects — Portfolio",
  description:
    "Selected engineering work — systems, interfaces, and infrastructure in depth.",
};

export default function ProjectsIndexPage() {
  const projects = getArchiveProjects();

  return (
    <div className="projects-archive">
      <header className="projects-archive-hero">
        <p className="mono-data">MODULE_ARCHIVE // FULL_INDEX</p>
        <h1 className="projects-archive-title">Projects</h1>
        <p className="projects-archive-lede">
          Deployments, interfaces, and infrastructure — each case study expands
          on the snapshot from the home rail. Open any entry for narrative,
          stack, and links.
        </p>
      </header>

      <ul className="projects-archive-list">
        {projects.map((project) => {
          const pinned = isProjectPinned(project.id);
          return (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className={
                  pinned
                    ? "projects-archive-card projects-archive-card--pinned"
                    : "projects-archive-card"
                }
              >
                <div className="projects-archive-card-media">
                  <Image
                    src={project.imageUrl}
                    alt=""
                    fill
                    className="img-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="projects-archive-card-body">
                  {pinned ? (
                    <p className="mono-data projects-archive-card-pin">
                      PINNED
                    </p>
                  ) : null}
                  <h2 className="projects-archive-card-title">
                    {project.title}
                  </h2>
                  <p className="projects-archive-card-desc">
                    {project.description}
                  </p>
                  <ul className="tag-list projects-archive-card-tags">
                    {project.tags.map((tag) => (
                      <li key={tag} className="tag mono-data">
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <span className="mono-data projects-archive-card-cta">
                    Open case study →
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
