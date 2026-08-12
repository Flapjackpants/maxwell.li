export type SlackMessage = {
  ts: string;
  channel: string;
  channelName: string;
  user: string;
  text: string;
};

export type SlackPayload = {
  messages: SlackMessage[];
  error?: string;
};

function parseChannels(config: Record<string, string>): string[] {
  const raw = config.channelIds ?? "";
  return raw
    .split(/[\s,]+/)
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export async function fetchSlackData(
  accessToken: string | null,
  config: Record<string, string>,
): Promise<SlackPayload> {
  if (!accessToken) {
    return { messages: [], error: "Connect Slack in settings" };
  }

  const channels = parseChannels(config);
  if (channels.length === 0) {
    return {
      messages: [],
      error: "Add Slack channel IDs in module settings",
    };
  }

  const messages: SlackMessage[] = [];

  for (const channel of channels) {
    const infoRes = await fetch(
      `https://slack.com/api/conversations.info?channel=${encodeURIComponent(channel)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const info = (await infoRes.json()) as {
      ok: boolean;
      channel?: { name?: string };
    };
    const channelName = info.channel?.name ?? channel;

    const histRes = await fetch(
      `https://slack.com/api/conversations.history?channel=${encodeURIComponent(channel)}&limit=5`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const hist = (await histRes.json()) as {
      ok: boolean;
      error?: string;
      messages?: { ts: string; user?: string; text?: string; bot_id?: string }[];
    };
    if (!hist.ok) {
      messages.push({
        ts: String(Date.now()),
        channel,
        channelName,
        user: "system",
        text: `Error: ${hist.error ?? "unknown"}`,
      });
      continue;
    }

    for (const m of hist.messages ?? []) {
      messages.push({
        ts: m.ts,
        channel,
        channelName,
        user: m.user ?? m.bot_id ?? "unknown",
        text: (m.text ?? "").slice(0, 280),
      });
    }
  }

  messages.sort((a, b) => Number(b.ts) - Number(a.ts));
  return { messages: messages.slice(0, 20) };
}
