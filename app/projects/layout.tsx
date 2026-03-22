import Link from "next/link";
import { PortfolioBackground } from "../components/PortfolioBackground";

export default function ProjectsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="page-root projects-archive-root">
      <PortfolioBackground />
      <div className="page-layer projects-archive-layer">
        <header className="projects-archive-header">
          <Link href="/" className="projects-archive-back mono-data">
            ← Index
          </Link>
          <span className="projects-archive-label mono-data">
            ARCHIVE // WORK
          </span>
        </header>
        <div className="projects-archive-main">{children}</div>
      </div>
    </div>
  );
}
