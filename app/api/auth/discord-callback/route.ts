import { handleDiscordCallback } from "@/lib/auth/handle-discord-callback";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleDiscordCallback(request);
}
