import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-user";
import { getModuleById, runModuleFetch } from "@/lib/dashboard/modules/registry";
import { resolveAccessToken } from "@/lib/dashboard/oauth/flow";
import { getModuleSettings } from "@/lib/dashboard/settings";
import type { AuthProvider } from "@/lib/dashboard/types";
import { fetchStocksData, type StockRange } from "@/lib/dashboard/modules/stocks/fetch";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const mod = getModuleById(id);
  if (!mod) {
    return NextResponse.json({ error: "Unknown module" }, { status: 404 });
  }

  const settings = await getModuleSettings(session!.userId, id);
  if (!settings?.enabled) {
    return NextResponse.json(
      { error: "Module disabled", disabled: true },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);

  try {
    if (id === "stocks") {
      const range = (searchParams.get("range") ?? "day") as StockRange;
      const valid: StockRange[] = ["day", "month", "year", "all"];
      const safeRange = valid.includes(range) ? range : "day";
      const data = await fetchStocksData(settings.config, safeRange);
      return NextResponse.json(data);
    }

    let config = { ...settings.config };
    if (id === "canvas" && !config.baseUrl) {
      const { getProviderToken } = await import("@/lib/dashboard/tokens");
      const canvasToken = await getProviderToken(session!.userId, "canvas");
      if (canvasToken?.meta.baseUrl) {
        config = { ...config, baseUrl: canvasToken.meta.baseUrl };
      }
    }

    const data = await runModuleFetch(id, {
      userId: session!.userId,
      config,
      getAccessToken: (provider: AuthProvider) =>
        resolveAccessToken(session!.userId, provider),
    });
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
