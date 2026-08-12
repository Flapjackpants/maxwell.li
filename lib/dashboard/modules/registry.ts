import type {
  AuthProvider,
  DashboardModuleContext,
  DashboardModuleDefinition,
  ModuleMeta,
} from "@/lib/dashboard/types";
import { fetchCalendarData } from "./calendar/fetch";
import { fetchCanvasData } from "./canvas/fetch";
import { fetchDiscordMessagesData } from "./discord/fetch";
import { fetchGmailData } from "./gmail/fetch";
import { fetchSlackData } from "./slack/fetch";
import { fetchStocksData } from "./stocks/fetch";
import { fetchUmazingOrdersData } from "./umazing/fetch";
import { fetchYoutubeData } from "./youtube/fetch";

const modules: DashboardModuleDefinition[] = [
  {
    id: "stocks",
    title: "Stocks",
    description: "Watchlist prices and day/month/year/all-time change",
    authProvider: "none",
    defaultEnabled: true,
    configFields: [
      {
        key: "tickers",
        label: "Tickers",
        type: "text",
        placeholder: "AAPL, MSFT, GOOGL",
        help: "Comma-separated symbols (max 20)",
      },
    ],
    fetchData: async (ctx) => fetchStocksData(ctx.config, "day"),
  },
  {
    id: "youtube",
    title: "YouTube",
    description: "Channel subscribers, views, and video count",
    authProvider: "google",
    defaultEnabled: true,
    fetchData: async (ctx) =>
      fetchYoutubeData(await ctx.getAccessToken("google")),
  },
  {
    id: "gmail",
    title: "Gmail",
    description: "Recent inbox messages",
    authProvider: "google",
    defaultEnabled: true,
    fetchData: async (ctx) =>
      fetchGmailData(await ctx.getAccessToken("google")),
  },
  {
    id: "calendar",
    title: "Calendar",
    description: "Upcoming Google Calendar events",
    authProvider: "google",
    defaultEnabled: true,
    fetchData: async (ctx) =>
      fetchCalendarData(await ctx.getAccessToken("google")),
  },
  {
    id: "slack",
    title: "Slack",
    description: "Recent messages from selected channels",
    authProvider: "slack",
    defaultEnabled: false,
    configFields: [
      {
        key: "channelIds",
        label: "Channel IDs",
        type: "textarea",
        placeholder: "C01234567, C089ABCDEF",
        help: "Comma-separated Slack channel IDs",
      },
    ],
    fetchData: async (ctx) =>
      fetchSlackData(await ctx.getAccessToken("slack"), ctx.config),
  },
  {
    id: "discord",
    title: "Discord",
    description: "Recent messages from bot-accessible channels",
    authProvider: "discord",
    defaultEnabled: false,
    configFields: [
      {
        key: "channelIds",
        label: "Channel IDs",
        type: "textarea",
        placeholder: "123456789012345678",
        help: "Comma-separated Discord channel IDs the bot can read",
      },
    ],
    fetchData: async (ctx) => fetchDiscordMessagesData(ctx.config),
  },
  {
    id: "umazing",
    title: "Umazing orders",
    description: "Open and recent shop orders",
    authProvider: "none",
    defaultEnabled: true,
    fetchData: async () => fetchUmazingOrdersData(),
  },
  {
    id: "canvas",
    title: "Canvas",
    description: "Upcoming and overdue assignments",
    authProvider: "canvas",
    defaultEnabled: false,
    configFields: [
      {
        key: "baseUrl",
        label: "Canvas base URL",
        type: "text",
        placeholder: "https://canvas.university.edu",
      },
    ],
    fetchData: async (ctx) =>
      fetchCanvasData(await ctx.getAccessToken("canvas"), ctx.config),
  },
];

export function getModules(): DashboardModuleDefinition[] {
  return modules;
}

export function getModuleMetas(): ModuleMeta[] {
  return modules.map(
    ({ id, title, description, authProvider, defaultEnabled, configFields }) => ({
      id,
      title,
      description,
      authProvider,
      defaultEnabled,
      configFields,
    }),
  );
}

export function getModuleById(
  id: string,
): DashboardModuleDefinition | undefined {
  return modules.find((m) => m.id === id);
}

export function providersForEnabledModules(
  enabledIds: string[],
): AuthProvider[] {
  const set = new Set<AuthProvider>();
  for (const id of enabledIds) {
    const mod = getModuleById(id);
    if (mod && mod.authProvider !== "none") {
      set.add(mod.authProvider);
    }
  }
  return [...set];
}

export async function runModuleFetch(
  moduleId: string,
  ctx: DashboardModuleContext,
): Promise<unknown> {
  const mod = getModuleById(moduleId);
  if (!mod) throw new Error(`Unknown module: ${moduleId}`);
  return mod.fetchData(ctx);
}
