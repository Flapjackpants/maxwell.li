import type { SponsorAnalytics, StudioReach } from "./types";

export const CHANNEL = {
  name: "FJP",
  handle: "@flapjackpants",
  url: "https://www.youtube.com/@flapjackpants",
  niche: "Minecraft survival building, world tours, farms and builds viewers can copy",
  formats: "Long-form videos (20+ min) plus Shorts",
  overview:
    "FJP is a Minecraft building channel built around long-term survival worlds, mega-projects and cinematic build showcases, with some worlds now five years in the making.",
} as const;

export const CONTACT = {
  name: "Maxwell Li",
  email: "maxkli2007@gmail.com",
  turnaround: "1–2 months",
} as const;

export const RATE_CARD: readonly {
  format: string;
  included: string;
  rate: string;
}[] = [
  {
    format: "Integrated segment",
    included:
      "60–90 second spoken segment in a long-form video, link and code in the description and pinned comment",
    rate: "Starting at $250 / video",
  },
  {
    format: "Dedicated video",
    included:
      "A full video built around the product, such as a server tour or a mod showcase",
    rate: "Starting at $1,000 / video",
  },
  {
    format: "Short",
    included: "A 30–60 second Short featuring the product",
    rate: "Starting at $75 / Short",
  },
  {
    format: "Bundle",
    included: "Three integrated segments over three months",
    rate: "Starting at $600 / bundle",
  },
];

export const RATE_NOTE =
  "The best fit is Minecraft-adjacent products shown inside the build itself, where viewers are already paying attention.";

export const STUDIO_REACH: StudioReach = {
  asOf: "2026-10-14",
  uniqueMonthlyViewers: 4200,
  newViewerPercent: 79.7,
  ctrPercent: 4.5,
  impressions12mo: 569000,
};

// Fill with YouTube video ids so embeds show in snapshot mode.
export const STATIC_FEATURED_VIDEO_IDS: {
  latestId: string | null;
  topId: string | null;
} = { latestId: null, topId: null };

export const STATIC_ANALYTICS: SponsorAnalytics = {
  source: "snapshot",
  asOf: "2026-10-14",
  subscriberCount: 1214,
  last28: {
    startDate: "2026-09-16",
    endDate: "2026-10-13",
    views: 12500,
    viewsPrior: 5100,
    watchHours: 564,
    subscribersGained: 123,
    avgViewDurationSec: 477,
    engagementRate: null,
  },
  monthlyViews: [
    { month: "2025-11", views: 717 },
    { month: "2025-12", views: 2200 },
    { month: "2026-01", views: 9400 },
    { month: "2026-02", views: 3500 },
    { month: "2026-03", views: 3400 },
    { month: "2026-04", views: 1600 },
    { month: "2026-05", views: 3500 },
    { month: "2026-06", views: 4300 },
    { month: "2026-07", views: 1400 },
    { month: "2026-08", views: 5700 },
    { month: "2026-09", views: 5610 },
  ],
  audience: {
    age: [
      { label: "13–17", percent: 9.6 },
      { label: "18–24", percent: 32.1 },
      { label: "25–34", percent: 45.7 },
      { label: "35–44", percent: 9.1 },
      { label: "45–54", percent: 3.5 },
      { label: "55–64", percent: 0 },
      { label: "65+", percent: 0 },
    ],
    malePercent: 95.5,
    countries: [
      { label: "United States", percent: 32 },
      { label: "United Kingdom", percent: 5.9 },
      { label: "Germany", percent: 3.6 },
      { label: "Canada", percent: 3.5 },
      { label: "Brazil", percent: 2.6 },
    ],
    devices: [
      { label: "Computer", percent: 37 },
      { label: "TV", percent: 30 },
    ],
    traffic: [{ label: "Browse features & home feed", percent: 82 }],
  },
  topVideos: [
    {
      id: null,
      title: "I spent 5 YEARS building the same forever world!",
      publishedAt: "2026-01",
      views: 10754,
      avgViewDurationSec: 797,
      subscribersGained: 230,
      engagementRate: null,
    },
    {
      id: null,
      title: "Minecraft building is too easy",
      publishedAt: "2025-12",
      views: 5206,
      avgViewDurationSec: 431,
      subscribersGained: 117,
      engagementRate: null,
    },
    {
      id: null,
      title: "This took WAY too long to build...",
      publishedAt: "2026-05",
      views: 4505,
      avgViewDurationSec: 239,
      subscribersGained: 109,
      engagementRate: null,
    },
    {
      id: null,
      title: "Everyone should build this farm in Minecraft",
      publishedAt: "2026-09",
      views: 3758,
      avgViewDurationSec: 342,
      subscribersGained: 78,
      engagementRate: null,
    },
    {
      id: null,
      title: "This build changed my world forever...",
      publishedAt: "2026-08",
      views: 3541,
      avgViewDurationSec: 205,
      subscribersGained: 49,
      engagementRate: null,
    },
    {
      id: null,
      title: "This just leveled up how I build",
      publishedAt: "2025-11",
      views: 2204,
      avgViewDurationSec: 452,
      subscribersGained: 84,
      engagementRate: null,
    },
  ],
  featured: STATIC_FEATURED_VIDEO_IDS,
};
