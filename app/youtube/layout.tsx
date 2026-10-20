import Link from "next/link";
import { PortfolioBackground } from "../components/PortfolioBackground";

export default function YoutubeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="page-root site-root">
      <PortfolioBackground />
      <div className="page-layer">
        <header className="site-header">
          <div className="site-header__inner">
            <Link href="/" className="site-brand">
              ← Index
            </Link>
            <span className="site-label">MEDIA_KIT // YOUTUBE</span>
          </div>
        </header>
        <div className="site-main">{children}</div>
      </div>
    </div>
  );
}
