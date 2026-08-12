import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-user";
import { getModuleMetas } from "@/lib/dashboard/modules/registry";
import { providerNeedsConnect } from "@/lib/dashboard/oauth/flow";
import {
  getDashboardSettings,
  saveDashboardSettings,
} from "@/lib/dashboard/settings";
import {
  isDiscordBotConfigured,
  listConnectedProviders,
} from "@/lib/dashboard/tokens";
import type { ModulesSettingsMap } from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const settings = await getDashboardSettings(session!.userId);
  const connected = await listConnectedProviders(session!.userId);
  const connectedSet = new Set<string>(connected);
  if (isDiscordBotConfigured()) connectedSet.add("discord");

  const providers = ["google", "slack", "discord", "canvas"] as const;
  const providerStatus: Record<
    string,
    { connected: boolean; needsConnect: boolean }
  > = {};
  for (const p of providers) {
    const needs = await providerNeedsConnect(session!.userId, p);
    providerStatus[p] = {
      connected: connectedSet.has(p),
      needsConnect: needs,
    };
  }

  return NextResponse.json({
    modules: getModuleMetas(),
    settings,
    providers: providerStatus,
  });
}

const putSchema = z.object({
  modules: z.record(
    z.string(),
    z.object({
      enabled: z.boolean(),
      config: z.record(z.string(), z.string()).default({}),
    }),
  ),
});

export async function PUT(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid settings payload" },
      { status: 400 },
    );
  }

  const saved = await saveDashboardSettings(
    session!.userId,
    parsed.data.modules as ModulesSettingsMap,
  );
  return NextResponse.json({ settings: saved });
}
