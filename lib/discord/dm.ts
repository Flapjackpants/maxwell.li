import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/shop/order-status";

const DISCORD_API = "https://discord.com/api/v10";

function getBotToken(): string {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN is not set");
  return token;
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export type DmResult = { ok: true } | { ok: false; reason: string };

export async function sendOrderStatusDm(
  discordUserId: string,
  orderId: string,
  status: OrderStatus,
): Promise<DmResult> {
  const token = getBotToken();
  const label = ORDER_STATUS_LABELS[status];
  const orderUrl = `${getAppUrl()}/shop/orders/${orderId}`;
  const content = `**Order update** (#${orderId.slice(0, 8)})\nStatus: **${label}**\nView your order: ${orderUrl}`;

  try {
    const channelRes = await fetch(`${DISCORD_API}/users/${discordUserId}/channels`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient_id: discordUserId }),
    });

    if (!channelRes.ok) {
      const text = await channelRes.text();
      return {
        ok: false,
        reason: `Could not open DM channel (${channelRes.status}): ${text}`,
      };
    }

    const channel = (await channelRes.json()) as { id: string };

    const msgRes = await fetch(`${DISCORD_API}/channels/${channel.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!msgRes.ok) {
      const text = await msgRes.text();
      return {
        ok: false,
        reason: `Could not send DM (${msgRes.status}): ${text}`,
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Unknown DM error",
    };
  }
}
