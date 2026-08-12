import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dashboardSettings } from "@/lib/db/schema";
import { getModuleMetas } from "@/lib/dashboard/modules/registry";
import type { ModuleSettingsEntry, ModulesSettingsMap } from "@/lib/dashboard/types";

function defaultsMap(): ModulesSettingsMap {
  const map: ModulesSettingsMap = {};
  for (const meta of getModuleMetas()) {
    map[meta.id] = { enabled: meta.defaultEnabled, config: {} };
  }
  return map;
}

function mergeWithDefaults(raw: unknown): ModulesSettingsMap {
  const defaults = defaultsMap();
  if (!raw || typeof raw !== "object") return defaults;
  const incoming = raw as Record<string, Partial<ModuleSettingsEntry>>;
  for (const id of Object.keys(defaults)) {
    const entry = incoming[id];
    if (!entry) continue;
    defaults[id] = {
      enabled:
        typeof entry.enabled === "boolean"
          ? entry.enabled
          : defaults[id]!.enabled,
      config:
        entry.config && typeof entry.config === "object"
          ? Object.fromEntries(
              Object.entries(entry.config).map(([k, v]) => [
                k,
                typeof v === "string" ? v : String(v ?? ""),
              ]),
            )
          : defaults[id]!.config,
    };
  }
  return defaults;
}

export async function getDashboardSettings(
  userId: number,
): Promise<ModulesSettingsMap> {
  const rows = await db
    .select()
    .from(dashboardSettings)
    .where(eq(dashboardSettings.userId, userId))
    .limit(1);

  if (!rows[0]) return defaultsMap();

  try {
    return mergeWithDefaults(JSON.parse(rows[0].modulesJson));
  } catch {
    return defaultsMap();
  }
}

export async function saveDashboardSettings(
  userId: number,
  modules: ModulesSettingsMap,
): Promise<ModulesSettingsMap> {
  const merged = mergeWithDefaults(modules);
  const json = JSON.stringify(merged);
  const now = new Date();

  const existing = await db
    .select({ userId: dashboardSettings.userId })
    .from(dashboardSettings)
    .where(eq(dashboardSettings.userId, userId))
    .limit(1);

  if (existing[0]) {
    await db
      .update(dashboardSettings)
      .set({ modulesJson: json, updatedAt: now })
      .where(eq(dashboardSettings.userId, userId));
  } else {
    await db.insert(dashboardSettings).values({
      userId,
      modulesJson: json,
      updatedAt: now,
    });
  }

  return merged;
}

export async function getModuleSettings(
  userId: number,
  moduleId: string,
): Promise<ModuleSettingsEntry | null> {
  const all = await getDashboardSettings(userId);
  return all[moduleId] ?? null;
}
