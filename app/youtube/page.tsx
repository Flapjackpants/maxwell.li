import type { Metadata } from "next";
import Image from "next/image";
import { Youtube } from "lucide-react";
import { getSponsorAnalytics } from "@/lib/youtube/analytics";
import {
  CHANNEL,
  CONTACT,
  RATE_CARD,
  RATE_NOTE,
  STUDIO_REACH,
} from "@/lib/youtube/sponsor-kit";
import {
  formatCompact,
  formatDate,
  formatDuration,
  formatMonth,
  formatPercent,
} from "@/lib/youtube/format";
import type { TopVideo } from "@/lib/youtube/types";
import { BarList, ColumnChart } from "./components/Bars";

// Snapshot videos with a known id still get a thumbnail from the public CDN.
function thumbFor(v: TopVideo): string | null {
  if (v.thumbnailUrl) return v.thumbnailUrl;
  return v.id ? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` : null;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FJP on YouTube — Sponsor Kit",
  description:
    "Live channel stats, audience and rates for sponsoring FJP (@flapjackpants), a Minecraft building channel.",
};

export default async function YoutubeSponsorPage() {
  const data = await getSponsorAnalytics();
  const live = data.source === "live";
  const { last28, audience, featured, channel } = data;
  const delta =
    last28.viewsPrior === null ? null : last28.views - last28.viewsPrior;
  const sourceName = live ? "YouTube Analytics" : "YouTube Studio";
  const embeds: { id: string; title: string }[] = [];
  if (featured.latestId)
    embeds.push({ id: featured.latestId, title: "Latest upload" });
  if (featured.topId && featured.topId !== featured.latestId)
    embeds.push({ id: featured.topId, title: "Most-watched video" });

  return (
    <main>
      <div className="yt-hero">
        <div className="yt-hero__banner">
          {channel.bannerUrl && (
            <Image
              src={channel.bannerUrl}
              alt=""
              fill
              priority
              sizes="(min-width: 80rem) 80rem, 100vw"
            />
          )}
        </div>
        <div className="yt-hero__identity">
          {channel.avatarUrl && (
            <Image
              className="yt-hero__avatar"
              src={channel.avatarUrl}
              alt={`${channel.title ?? CHANNEL.name} profile picture`}
              width={96}
              height={96}
              priority
            />
          )}
          <div>
            <p className="yt-hero__name">{channel.title ?? CHANNEL.name}</p>
            <p className="yt-muted">
              {CHANNEL.handle} · {data.subscriberCount.toLocaleString()} subscribers
            </p>
          </div>
        </div>
      </div>

      <header className="page-head">
        <p className="eyebrow">SPONSOR_KIT // YOUTUBE</p>
        <h1 className="page-head__title">FJP on YouTube</h1>
        <p className="page-head__lede">{CHANNEL.overview}</p>
        <p className="yt-badge">
          {`${live ? "Live data · through " : "Snapshot · "}${formatDate(data.asOf)}`}
        </p>
        <div className="yt-actions">
          <a
            className="yt-button"
            href={CHANNEL.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Youtube aria-hidden="true" />
            Visit {CHANNEL.handle}
          </a>
          <a className="text-link" href={`mailto:${CONTACT.email}`}>
            Book a sponsorship →
          </a>
        </div>
        <ul className="tag-list">
          <li className="tag">Minecraft</li>
          <li className="tag">Survival building</li>
          <li className="tag">Long-form + Shorts</li>
        </ul>
      </header>

      <section className="yt-section" id="kpis" aria-labelledby="yt-kpis-title">
        <h2 className="yt-section__title" id="yt-kpis-title">
          Last 28 days
        </h2>
        <p className="yt-muted">
          {last28.startDate}–{last28.endDate}
        </p>
        <dl className="yt-kpis">
          <div className="yt-kpi">
            <dt>Views</dt>
            <dd className="mono-data">{formatCompact(last28.views)}</dd>
            {delta !== null && (
              <dd className="yt-kpi__delta">
                {delta < 0 ? "−" : "+"}
                {formatCompact(Math.abs(delta))} vs prior 28 days
              </dd>
            )}
          </div>
          <div className="yt-kpi">
            <dt>Watch time</dt>
            <dd className="mono-data">{last28.watchHours.toLocaleString()} hrs</dd>
          </div>
          <div className="yt-kpi">
            <dt>New subscribers</dt>
            <dd className="mono-data">+{last28.subscribersGained}</dd>
          </div>
          <div className="yt-kpi">
            <dt>Total subscribers</dt>
            <dd className="mono-data">{data.subscriberCount.toLocaleString()}</dd>
          </div>
          <div className="yt-kpi">
            <dt>Avg view duration</dt>
            <dd className="mono-data">{formatDuration(last28.avgViewDurationSec)}</dd>
          </div>
          {last28.engagementRate !== null && (
            <div className="yt-kpi">
              <dt>Engagement rate</dt>
              <dd className="mono-data">{formatPercent(last28.engagementRate, 2)}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="yt-section" aria-labelledby="yt-growth-title">
        <h2 className="yt-section__title" id="yt-growth-title">
          Growth
        </h2>
        <ColumnChart
          title="Monthly views"
          caption={
            live
              ? "Total views per full month · YouTube Analytics"
              : "Engaged views per month · YouTube Studio export"
          }
          points={data.monthlyViews.map((m) => ({
            label: formatMonth(m.month),
            value: m.views,
          }))}
        />
      </section>

      <section className="yt-section" aria-labelledby="yt-audience-title">
        <h2 className="yt-section__title" id="yt-audience-title">
          Audience
        </h2>
        <p className="yt-muted">
          Share of views, {last28.startDate}–{last28.endDate} · {sourceName}
        </p>
        <div className="yt-grid">
          <div>
            <BarList title="Age" items={audience.age} highlightMax />
            {audience.malePercent !== null && (
              <p className="mono-data">{formatPercent(audience.malePercent)} male</p>
            )}
          </div>
          <BarList title="Top countries" items={audience.countries} />
          <BarList title="Watch time by device" items={audience.devices} />
          <BarList title="How viewers find FJP" items={audience.traffic} />
        </div>
      </section>

      <section className="yt-section" aria-labelledby="yt-reach-title">
        <h2 className="yt-section__title" id="yt-reach-title">
          Reach
        </h2>
        <dl className="yt-kpis">
          <div className="yt-kpi">
            <dt>Unique monthly viewers</dt>
            <dd className="mono-data">{formatCompact(STUDIO_REACH.uniqueMonthlyViewers)}</dd>
          </div>
          <div className="yt-kpi">
            <dt>New to the channel</dt>
            <dd className="mono-data">{formatPercent(STUDIO_REACH.newViewerPercent)}</dd>
          </div>
          <div className="yt-kpi">
            <dt>Thumbnail CTR</dt>
            <dd className="mono-data">{formatPercent(STUDIO_REACH.ctrPercent)}</dd>
          </div>
          <div className="yt-kpi">
            <dt>Impressions (12 mo)</dt>
            <dd className="mono-data">{formatCompact(STUDIO_REACH.impressions12mo)}</dd>
          </div>
        </dl>
        <p className="yt-muted">
          From YouTube Studio, {formatDate(STUDIO_REACH.asOf)}. These metrics are
          not available through the YouTube API.
        </p>
      </section>

      {embeds.length > 0 && (
        <section className="yt-section" aria-labelledby="yt-watch-title">
          <h2 className="yt-section__title" id="yt-watch-title">
            Watch the channel
          </h2>
          <div className="yt-embeds">
            {embeds.map((e) => (
              <figure key={e.id}>
                <iframe
                  className="yt-embed"
                  src={`https://www.youtube-nocookie.com/embed/${e.id}`}
                  title={e.title}
                  loading="lazy"
                  allow="accelerometer; encrypted-media; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                <figcaption className="yt-muted">{e.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="yt-section" aria-labelledby="yt-top-title">
        <h2 className="yt-section__title" id="yt-top-title">
          Top videos
        </h2>
        <p className="yt-muted">Past 12 months</p>
        <ol className="yt-videos">
          {data.topVideos.map((v, i) => {
            const thumb = thumbFor(v);
            const href = v.id ? `https://www.youtube.com/watch?v=${v.id}` : null;
            const media = (
              <div className="yt-video__thumb">
                {thumb && (
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    sizes="(min-width: 48rem) 33vw, 100vw"
                  />
                )}
                <span className="yt-video__rank mono-data">#{i + 1}</span>
              </div>
            );
            return (
              <li key={v.id ?? v.title} className="yt-video">
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
                    {media}
                  </a>
                ) : (
                  media
                )}
                <h3 className="yt-video__title">
                  {href ? (
                    <a className="text-link" href={href} target="_blank" rel="noopener noreferrer">
                      {v.title}
                    </a>
                  ) : (
                    v.title
                  )}
                </h3>
                <p className="yt-muted">{formatMonth(v.publishedAt.slice(0, 7))}</p>
                <dl className="yt-video__stats mono-data">
                  <div>
                    <dt>Views</dt>
                    <dd>{formatCompact(v.views)}</dd>
                  </div>
                  <div>
                    <dt>Avg. duration</dt>
                    <dd>{formatDuration(v.avgViewDurationSec)}</dd>
                  </div>
                  <div>
                    <dt>Engagement</dt>
                    <dd>
                      {v.engagementRate === null ? "—" : formatPercent(v.engagementRate, 2)}
                    </dd>
                  </div>
                  <div>
                    <dt>Subs gained</dt>
                    <dd>+{v.subscribersGained}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="yt-section" aria-labelledby="yt-rates-title">
        <h2 className="yt-section__title" id="yt-rates-title">
          Sponsorship options
        </h2>
        <p>{RATE_NOTE}</p>
        <ul className="yt-rates">
          {RATE_CARD.map((r) => (
            <li key={r.format} className="yt-rate">
              <h3>{r.format}</h3>
              <p>{r.included}</p>
              <p className="yt-rate__price mono-data">{r.rate}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="yt-section" id="contact" aria-labelledby="yt-contact-title">
        <h2 className="yt-section__title" id="yt-contact-title">
          Contact
        </h2>
        <dl>
          <dt>Name</dt>
          <dd>{CONTACT.name}</dd>
          <dt>Business email</dt>
          <dd>
            <a className="text-link" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
          </dd>
          <dt>Turnaround</dt>
          <dd>{CONTACT.turnaround}</dd>
        </dl>
        <p>Reach out to book a slot or request the full analytics export.</p>
      </section>
    </main>
  );
}
