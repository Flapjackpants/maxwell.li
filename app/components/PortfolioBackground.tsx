import { AsciiSplash } from "./AsciiSplash";

/** Fixed phosphor grid and drifting ultraviolet stripes behind portfolio pages. */
export function PortfolioBackground() {
  return (
    <div className="portfolio-bg" aria-hidden>
      <div className="portfolio-bg__gradient" />
      <div className="portfolio-bg__grid" />
      <div className="portfolio-bg__stripes" />
      <div className="portfolio-bg__vignette" />
      <AsciiSplash />
    </div>
  );
}
