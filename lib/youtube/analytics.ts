import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { resolveAccessToken } from "@/lib/dashboard/oauth/flow";
import { STATIC_ANALYTICS } from "./sponsor-kit";
import type { Share, SponsorAnalytics, TopVideo } from "./types";

const ANALYTICS_URL = "https://youtubeanalytics.googleapis.com/v2/reports";
const DATA_URL = "https://www.googleapis.com/youtube/v3";

type Row = Record<string, string | number>;

async function getAnalyticsUserId(): Promise<number> {
  const adminId = process.env.ADMIN_DISCORD_ID?.trim();
  if (!adminId) throw new Error("ADMIN_DISCORD_ID is not set");
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.discordId, adminId))
    .limit(1);
  if (!row) throw new Error("Admin user not found");
  return row.id;
}

async function runReport(
  token: string,
  params: Record<string, string>,
): Promise<Row[]> {
  const qs = new URLSearchParams({ ids: "channel==MINE", ...params });
  const res = await fetch(`${ANALYTICS_URL}?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube Analytics error: ${res.status} ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    columnHeaders?: { name: string }[];
    rows?: (string | number)[][];
  };
  const headers = json.columnHeaders ?? [];
  return (json.rows ?? []).map((r) => {
    const obj: Row = {};
    headers.forEach((h, i) => {
      obj[h.name] = r[i];
    });
    return obj;
  });
}

async function dataApi<T>(
  token: string,
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const res = await fetch(`${DATA_URL}/${path}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube Data API error: ${res.status} ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

// ─── Dates (UTC, "YYYY-MM-DD") ───────────────────────────────────────────
const DAY_MS = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY_MS);

function dateWindows(now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end28 = addDays(today, -3);
  const start28 = addDays(end28, -27);
  const priorEnd = addDays(start28, -1);
  const priorStart = addDays(priorEnd, -27);
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  return {
    end28: iso(end28),
    start28: iso(start28),
    priorEnd: iso(priorEnd),
    priorStart: iso(priorStart),
    monthsStart: iso(new Date(Date.UTC(y, m - 12, 1))),
    monthsEnd: iso(new Date(Date.UTC(y, m, 0))),
    yearStart: iso(addDays(end28, -364)),
  };
}

// ─── Transforms ──────────────────────────────────────────────────────────
const round = (n: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};
const num = (v: string | number | undefined) => Number(v ?? 0) || 0;

const AGE_LABELS: [string, string][] = [
  ["age13-17", "13–17"],
  ["age18-24", "18–24"],
  ["age25-34", "25–34"],
  ["age35-44", "35–44"],
  ["age45-54", "45–54"],
  ["age55-64", "55–64"],
  ["age65-", "65+"],
];

export function ageShares(rows: Row[]): Share[] {
  const sums = new Map<string, number>();
  for (const r of rows) {
    const k = String(r.ageGroup);
    sums.set(k, (sums.get(k) ?? 0) + num(r.viewerPercentage));
  }
  return AGE_LABELS.map(([key, label]) => ({
    label,
    percent: round(sums.get(key) ?? 0, 1),
  }));
}

export function malePercent(rows: Row[]): number | null {
  if (rows.length === 0) return null;
  const sum = rows
    .filter((r) => r.gender === "male")
    .reduce((acc, r) => acc + num(r.viewerPercentage), 0);
  return round(sum, 1);
}

export function toShares(
  rows: Row[],
  labelKey: string,
  valueKey: string,
  labels: Record<string, string>,
  limit: number,
): Share[] {
  const total = rows.reduce((acc, r) => acc + num(r[valueKey]), 0);
  if (total === 0) return [];
  return rows
    .map((r) => {
      const raw = String(r[labelKey]);
      return {
        label: labels[raw] ?? raw,
        percent: round((num(r[valueKey]) / total) * 100, 1),
      };
    })
    .sort((a, b) => b.percent - a.percent)
    .slice(0, limit);
}

const DEVICE_LABELS: Record<string, string> = {
  DESKTOP: "Computer",
  TV: "TV",
  MOBILE: "Mobile",
  TABLET: "Tablet",
  GAME_CONSOLE: "Game console",
  UNKNOWN_PLATFORM: "Other",
};

const TRAFFIC_LABELS: Record<string, string> = {
  SUBSCRIBER: "Browse features & home feed",
  BROWSE: "Browse features & home feed",
  YT_SEARCH: "YouTube search",
  RELATED_VIDEO: "Suggested videos",
  SHORTS: "Shorts feed",
  EXT_URL: "External sites",
  PLAYLIST: "Playlists",
  CHANNEL: "Channel pages",
  NO_LINK_OTHER: "Direct / unknown",
  NOTIFICATION: "Notifications",
  YT_OTHER_PAGE: "Other YouTube pages",
};

function countryLabels(rows: Row[]): Record<string, string> {
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  const out: Record<string, string> = {};
  for (const r of rows) {
    const code = String(r.country);
    try {
      out[code] = names.of(code) ?? code;
    } catch {
      out[code] = code;
    }
  }
  return out;
}

export function engagementRate(
  likes: number,
  comments: number,
  views: number,
): number | null {
  return views > 0 ? round(((likes + comments) / views) * 100, 2) : null;
}

const bestThumb = (t: Thumbs | undefined) =>
  (t?.maxres ?? t?.standard ?? t?.high ?? t?.medium ?? t?.default)?.url ?? null;

// bannerExternalUrl serves the full 2560x1440 upload; this suffix asks for the
// desktop-visible strip, matching what youtube.com shows.
const BANNER_CROP = "=w2120-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj";
const bannerCrop = (url: string | undefined) => (url ? `${url}${BANNER_CROP}` : null);

// ─── Live load ───────────────────────────────────────────────────────────
type Thumbs = Partial<
  Record<"default" | "medium" | "high" | "standard" | "maxres", { url?: string }>
>;
type ChannelsResponse = {
  items?: {
    snippet?: { title?: string; thumbnails?: Thumbs };
    brandingSettings?: { image?: { bannerExternalUrl?: string } };
    statistics?: { subscriberCount?: string };
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
  }[];
};
type VideosResponse = {
  items?: {
    id: string;
    snippet?: { title?: string; publishedAt?: string; thumbnails?: Thumbs };
  }[];
};
type PlaylistResponse = {
  items?: { contentDetails?: { videoId?: string } }[];
};

async function loadLiveAnalytics(): Promise<SponsorAnalytics> {
  const userId = await getAnalyticsUserId();
  const token = await resolveAccessToken(userId, "google");
  if (!token) throw new Error("No Google token for admin user");

  const w = dateWindows();
  const win = { startDate: w.start28, endDate: w.end28 };

  const [totals, prior, monthly, demo, countries, devices, traffic, top, channel] =
    await Promise.all([
      runReport(token, {
        ...win,
        metrics: "views,estimatedMinutesWatched,averageViewDuration,subscribersGained,likes,comments",
      }),
      runReport(token, { startDate: w.priorStart, endDate: w.priorEnd, metrics: "views" }),
      runReport(token, {
        startDate: w.monthsStart,
        endDate: w.monthsEnd,
        dimensions: "month",
        metrics: "views",
        sort: "month",
      }),
      runReport(token, { ...win, dimensions: "ageGroup,gender", metrics: "viewerPercentage" }),
      runReport(token, { ...win, dimensions: "country", metrics: "views", sort: "-views", maxResults: "5" }),
      runReport(token, { ...win, dimensions: "deviceType", metrics: "estimatedMinutesWatched" }),
      runReport(token, { ...win, dimensions: "insightTrafficSourceType", metrics: "views", sort: "-views" }),
      runReport(token, {
        startDate: w.yearStart,
        endDate: w.end28,
        dimensions: "video",
        metrics: "views,averageViewDuration,subscribersGained,likes,comments",
        sort: "-views",
        maxResults: "6",
      }),
      dataApi<ChannelsResponse>(token, "channels", {
        part: "snippet,statistics,contentDetails,brandingSettings",
        mine: "true",
      }),
    ]);

  const ch = channel.items?.[0];
  if (!ch) throw new Error("YouTube channel not found");

  const topIds = top.map((r) => String(r.video));
  const videos = topIds.length
    ? await dataApi<VideosResponse>(token, "videos", {
        part: "snippet",
        id: topIds.join(","),
      })
    : { items: [] };
  const meta = new Map((videos.items ?? []).map((v) => [v.id, v.snippet]));

  const uploads = ch.contentDetails?.relatedPlaylists?.uploads;
  const latest = uploads
    ? await dataApi<PlaylistResponse>(token, "playlistItems", {
        part: "contentDetails",
        maxResults: "1",
        playlistId: uploads,
      })
    : { items: [] };
  const latestId = latest.items?.[0]?.contentDetails?.videoId ?? null;

  const t = totals[0] ?? {};
  const topVideos: TopVideo[] = top.map((r) => {
    const id = String(r.video);
    const sn = meta.get(id);
    return {
      id,
      title: sn?.title ?? id,
      publishedAt: sn?.publishedAt ?? "",
      views: num(r.views),
      avgViewDurationSec: round(num(r.averageViewDuration)),
      subscribersGained: num(r.subscribersGained),
      engagementRate: engagementRate(num(r.likes), num(r.comments), num(r.views)),
      thumbnailUrl: bestThumb(sn?.thumbnails),
    };
  });

  return {
    source: "live",
    asOf: w.end28,
    subscriberCount: num(ch.statistics?.subscriberCount),
    channel: {
      title: ch.snippet?.title ?? null,
      avatarUrl: bestThumb(ch.snippet?.thumbnails),
      bannerUrl: bannerCrop(ch.brandingSettings?.image?.bannerExternalUrl),
    },
    last28: {
      startDate: w.start28,
      endDate: w.end28,
      views: num(t.views),
      viewsPrior: prior.length ? num(prior[0].views) : null,
      watchHours: round(num(t.estimatedMinutesWatched) / 60),
      subscribersGained: num(t.subscribersGained),
      avgViewDurationSec: round(num(t.averageViewDuration)),
      engagementRate: engagementRate(num(t.likes), num(t.comments), num(t.views)),
    },
    monthlyViews: monthly.map((r) => ({
      month: String(r.month),
      views: num(r.views),
    })),
    audience: {
      age: ageShares(demo),
      malePercent: malePercent(demo),
      countries: toShares(countries, "country", "views", countryLabels(countries), 5),
      devices: toShares(devices, "deviceType", "estimatedMinutesWatched", DEVICE_LABELS, 5),
      traffic: toShares(traffic, "insightTrafficSourceType", "views", TRAFFIC_LABELS, 4),
    },
    topVideos,
    featured: { latestId, topId: topVideos[0]?.id ?? null },
  };
}

const getCachedLive = unstable_cache(loadLiveAnalytics, ["youtube-sponsor-analytics-v2"], {
  revalidate: 21600,
  tags: ["youtube-analytics"],
});

export async function getSponsorAnalytics(): Promise<SponsorAnalytics> {
  try {
    return await getCachedLive();
  } catch (err) {
    console.error("[youtube] live analytics failed:", err);
    return STATIC_ANALYTICS;
  }
}
