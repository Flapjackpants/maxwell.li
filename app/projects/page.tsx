import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getArchiveProjects, isProjectPinned } from "@/lib/projects";
import { TerminalWindow } from "../components/AsciiWindows";

const pad = (n: number) => String(n).padStart(2, "0");

export const metadata: Metadata = {
  title: "Projects — Portfolio",
  description:
    "Selected engineering work — systems, interfaces, and infrastructure in depth.",
};

export default function ProjectsIndexPage() {
  const projects = getArchiveProjects();

  return (
    <div>
      <header className="page-head page-head--archive">
        <div className="page-head__copy">
          <p className="eyebrow">MODULE_ARCHIVE // FULL_INDEX</p>
          <h1 className="page-head__title">Projects</h1>
          <p className="page-head__lede">
            Featured picks (marked Featured) sit at the top — the same short list
            from the home page. Everything below is the full chronological
            archive. Open any entry for narrative, stack, and links.
          </p>
        </div>
        <TerminalWindow src="/asciiify.png" className="page-head__readout" />
      </header>

      <ul className="project-list">
        {projects.map((project, i) => {
          const pinned = isProjectPinned(project.id);
          return (
            <li key={project.id} className={pinned ? "project-row--featured" : undefined}>
              <Link
                href={`/projects/${project.id}`}
                className="project-row hud-frame"
              >
                <div className="project-row__media">
                  <Image
                    src={project.imageUrl}
                    alt=""
                    fill
                    className="img-cover"
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  />
                </div>
                <div className="project-row__body">
                  <div className="project-row__index">
                    <span aria-hidden="true">{`${pad(i + 1)} // ${project.id.toUpperCase()}`}</span>
                    {pinned ? <span className="project-row__marker">FEATURED</span> : null}
                  </div>
                  <h2 className="project-row__title">{project.title}</h2>
                  <p className="project-row__desc">{project.description}</p>
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
