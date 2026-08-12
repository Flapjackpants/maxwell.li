import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-user";
import {
  clearQueueCookie,
  continueOAuthQueue,
} from "@/lib/dashboard/oauth/flow";
import {
  OAUTH_QUEUE_COOKIE,
  verifyOAuthQueue,
} from "@/lib/dashboard/oauth/queue";
import { cookies } from "next/headers";
import { upsertProviderToken } from "@/lib/dashboard/tokens";
import { getDashboardSettings, saveDashboardSettings } from "@/lib/dashboard/settings";

export const dynamic = "force-dynamic";

const schema = z.object({
  baseUrl: z.string().url(),
  accessToken: z.string().min(1),
  advanceQueue: z.boolean().optional(),
});

export async function POST(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Canvas credentials" }, { status: 400 });
  }

  const { baseUrl, accessToken, advanceQueue } = parsed.data;

  await upsertProviderToken(session!.userId, "canvas", {
    accessToken,
    meta: { baseUrl: baseUrl.replace(/\/$/, "") },
  });

  // Persist baseUrl into canvas module config as well
  const settings = await getDashboardSettings(session!.userId);
  const canvas = settings.canvas ?? { enabled: true, config: {} };
  settings.canvas = {
    ...canvas,
    config: { ...canvas.config, baseUrl: baseUrl.replace(/\/$/, "") },
  };
  await saveDashboardSettings(session!.userId, settings);

  if (advanceQueue) {
    const cookieStore = await cookies();
    const raw = cookieStore.get(OAUTH_QUEUE_COOKIE)?.value;
    if (raw) {
      const queue = await verifyOAuthQueue(raw);
      if (queue && queue.userId === session!.userId) {
        const next = await continueOAuthQueue(queue);
        const res = NextResponse.json({ redirectUrl: next.redirectUrl });
        if (next.setCookie) res.headers.append("Set-Cookie", next.setCookie);
        if (next.clearCookie)
          res.headers.append("Set-Cookie", clearQueueCookie());
        return res;
      }
    }
  }

  return NextResponse.json({ ok: true, redirectUrl: "/dashboard/settings?connected=1" });
}
