import { getAppOrigin } from "@/lib/app-url";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/shop/order-status";

const DISCORD_API = "https://discord.com/api/v10";

function getBotToken(): string {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN is not set");
  return token;
}

function getAppUrl(): string {
  return getAppOrigin();
}

export type DmResult = { ok: true } | { ok: false; reason: string };

function buildStatusMessage(
  orderId: string,
  status: OrderStatus,
  options?: { pickupLocation?: string; estimatedReadyTime?: string },
): string {
  const orderUrl = `${getAppUrl()}/shop/orders/${orderId}`;
  const shortId = orderId.slice(0, 8);

  if (status === "awaiting_pickup" && options?.pickupLocation) {
    return `**Order update** (#${shortId})\nYour order is awaiting pickup at **${options.pickupLocation}**.\nView your order: ${orderUrl}`;
  }

  if (status === "gathering_materials" && options?.estimatedReadyTime) {
    return `**Order update** (#${shortId})\nEstimated ready time: **${options.estimatedReadyTime}**\nView your order: ${orderUrl}`;
  }

  const label = ORDER_STATUS_LABELS[status];
  return `**Order update** (#${shortId})\nStatus: **${label}**\nView your order: ${orderUrl}`;
}

export async function sendOrderStatusDm(
  discordUserId: string,
  orderId: string,
  status: OrderStatus,
  options?: { pickupLocation?: string; estimatedReadyTime?: string },
): Promise<DmResult> {
  const token = getBotToken();
  const content = buildStatusMessage(orderId, status, options);

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
