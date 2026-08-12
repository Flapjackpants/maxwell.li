"use client";

import { CalendarPanel } from "./panels/CalendarPanel";
import { CanvasPanel } from "./panels/CanvasPanel";
import { DiscordPanel } from "./panels/DiscordPanel";
import { GmailPanel } from "./panels/GmailPanel";
import { SlackPanel } from "./panels/SlackPanel";
import { StocksPanel } from "./panels/StocksPanel";
import { UmazingPanel } from "./panels/UmazingPanel";
import { YoutubePanel } from "./panels/YoutubePanel";

const PANEL_MAP: Record<string, React.ComponentType> = {
  stocks: StocksPanel,
  youtube: YoutubePanel,
  gmail: GmailPanel,
  calendar: CalendarPanel,
  slack: SlackPanel,
  discord: DiscordPanel,
  umazing: UmazingPanel,
  canvas: CanvasPanel,
};

export function renderModulePanel(moduleId: string) {
  const Panel = PANEL_MAP[moduleId];
  if (!Panel) return null;
  return <Panel key={moduleId} />;
}

export function getPanelModuleIds(): string[] {
  return Object.keys(PANEL_MAP);
}
