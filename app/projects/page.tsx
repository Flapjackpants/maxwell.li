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
    <div>
      <header className="page-head">
        <p className="eyebrow">MODULE_ARCHIVE // FULL_INDEX</p>
        <h1 className="page-head__title">Projects</h1>
        <p className="page-head__lede">
          Featured picks (marked Featured) sit at the top — the same short list
          from the home page. Everything below is the full chronological
          archive. Open any entry for narrative, stack, and links.
        </p>
      </header>

      <ul className="project-list">
        {projects.map((project) => {
          const pinned = isProjectPinned(project.id);
          return (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="project-row grid-12"
              >
                <div className="project-row__media">
                  <Image
                    src={project.imageUrl}
                    alt=""
                    fill
                    className="img-cover"
                    sizes="(max-width: 768px) 100vw, 280px"
                  />
                </div>
                <div className="project-row__body">
                  {pinned ? (
                    <span className="project-row__marker">FEATURED</span>
                  ) : null}
                  <h2 className="project-row__title">{project.title}</h2>
                  <p className="project-row__desc">{project.description}</p>
                </div>
                <div className="project-row__meta">
                  <ul className="tag-list">
                    {project.tags.map((tag) => (
                      <li key={tag} className="tag">
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <span className="text-link">Open case study →</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
