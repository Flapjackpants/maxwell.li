import { formatCompact, formatPercent } from "@/lib/youtube/format";
import type { Share } from "@/lib/youtube/types";

export function ColumnChart({
  title,
  caption,
  points,
  highlightLast = true,
}: {
  title: string;
  caption: string;
  points: { label: string; value: number }[];
  highlightLast?: boolean;
}) {
  const max = Math.max(0, ...points.map((p) => p.value));
  return (
    <figure className="yt-chart">
      <figcaption>
        <span className="yt-chart__title">{title}</span>
        <span className="yt-chart__caption">{caption}</span>
      </figcaption>
      {max === 0 ? (
        <p className="yt-muted">No data yet.</p>
      ) : (
        <ol className="yt-columns">
          {points.map((p, i) => (
            <li
              key={p.label + i}
              className={
                highlightLast && i === points.length - 1
                  ? "yt-columns__item yt-columns__item--accent"
                  : "yt-columns__item"
              }
              style={{ "--bar": `${(p.value / max) * 100}%` } as React.CSSProperties}
            >
              <span className="mono-data yt-columns__value">
                {formatCompact(p.value)}
              </span>
              <div className="yt-columns__bar" aria-hidden="true" />
              <span className="yt-columns__label">{p.label}</span>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}

export function BarList({
  title,
  items,
  highlightMax = false,
}: {
  title: string;
  items: Share[];
  highlightMax?: boolean;
}) {
  const max = Math.max(0, ...items.map((i) => i.percent));
  return (
    <div className="yt-barlist">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="yt-muted">Not available.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.label} className="yt-barlist__row">
              <span>{item.label}</span>
              <div className="yt-barlist__track">
                <div
                  className={
                    highlightMax && item.percent === max && max > 0
                      ? "yt-barlist__fill yt-barlist__fill--accent"
                      : "yt-barlist__fill"
                  }
                  style={{ "--bar": `${item.percent}%` } as React.CSSProperties}
                />
              </div>
              <span className="mono-data">{formatPercent(item.percent)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
