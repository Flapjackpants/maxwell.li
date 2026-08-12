export type DiscordMessage = {
  id: string;
  channelId: string;
  channelLabel: string;
  author: string;
  content: string;
  timestamp: string;
};

export type DiscordPayload = {
  messages: DiscordMessage[];
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

export async function fetchDiscordMessagesData(
  config: Record<string, string>,
): Promise<DiscordPayload> {
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!botToken) {
    return {
      messages: [],
      error: "DISCORD_BOT_TOKEN is not configured",
    };
  }

  const channels = parseChannels(config);
  if (channels.length === 0) {
    return {
      messages: [],
      error: "Add Discord channel IDs in module settings",
    };
  }

  const messages: DiscordMessage[] = [];

  for (const channelId of channels) {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=5`,
      { headers: { Authorization: `Bot ${botToken}` } },
    );
    if (!res.ok) {
      const body = await res.text();
      messages.push({
        id: `err-${channelId}`,
        channelId,
        channelLabel: channelId,
        author: "system",
        content: `Error ${res.status}: ${body.slice(0, 100)}`,
        timestamp: new Date().toISOString(),
      });
      continue;
    }

    const data = (await res.json()) as {
      id: string;
      content: string;
      timestamp: string;
      author?: { username?: string };
    }[];

    for (const m of data) {
      messages.push({
        id: m.id,
        channelId,
        channelLabel: channelId,
        author: m.author?.username ?? "unknown",
        content: (m.content || "(embed/attachment)").slice(0, 280),
        timestamp: m.timestamp,
      });
    }
  }

  messages.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  return { messages: messages.slice(0, 20) };
}
