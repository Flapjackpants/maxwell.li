export type DataSource = "live" | "snapshot";
export type Share = { label: string; percent: number }; // percent 0–100
export type MonthPoint = { month: string; views: number }; // month "YYYY-MM"
export type TopVideo = {
  id: string | null; // YouTube video id; null in snapshot when unknown
  title: string;
  publishedAt: string; // ISO date or "YYYY-MM"
  views: number;
  avgViewDurationSec: number;
  subscribersGained: number;
  engagementRate: number | null; // (likes+comments)/views*100; null when unknown
};
export type SponsorAnalytics = {
  source: DataSource;
  asOf: string; // ISO date the numbers describe
  subscriberCount: number;
  last28: {
    startDate: string;
    endDate: string; // "YYYY-MM-DD"
    views: number;
    viewsPrior: number | null; // previous 28 days
    watchHours: number;
    subscribersGained: number;
    avgViewDurationSec: number;
    engagementRate: number | null; // percent
  };
  monthlyViews: MonthPoint[]; // oldest → newest, up to 12 full months
  audience: {
    age: Share[];
    malePercent: number | null;
    countries: Share[];
    devices: Share[];
    traffic: Share[];
  };
  topVideos: TopVideo[]; // max 6, sorted by views desc
  featured: { latestId: string | null; topId: string | null };
};
export type StudioReach = {
  // numbers NOT available from the API; hand-entered
  asOf: string;
  uniqueMonthlyViewers: number;
  newViewerPercent: number;
  ctrPercent: number;
  impressions12mo: number;
};
