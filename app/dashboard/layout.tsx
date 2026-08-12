import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioBackground } from "@/app/components/PortfolioBackground";

export const metadata: Metadata = {
  title: "Dashboard — Maxwell Li",
  description: "Personal ops dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-root dash-root">
      <PortfolioBackground />
      <div className="page-layer">
        <header className="projects-archive-header">
          <Link href="/" className="projects-archive-back">
            Maxwell Li
          </Link>
          <nav aria-label="Dashboard">
            <ul className="home-header-nav">
              <li>
                <Link href="/dashboard" className="home-nav-link">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="home-nav-link">
                  Settings
                </Link>
              </li>
              <li>
                <Link href="/api/auth/logout" className="home-nav-link">
                  Log out
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
