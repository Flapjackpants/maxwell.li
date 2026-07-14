import { getAppOrigin } from "@/lib/app-url";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/shop/order-status";

const DISCORD_API = "https://discord.com/api/v10";

function getBotToken(): string {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token) throw new Error("DISCORD_BOT_TOKEN is not set");
  return token;
}

function getAppUrl(): string {
  return getAppOrigin();
}

function getAdminDiscordId(): string | undefined {
  return process.env.ADMIN_DISCORD_ID?.trim() || undefined;
}

export type DmResult = { ok: true } | { ok: false; reason: string };

async function sendDiscordDm(
  discordUserId: string,
  content: string,
): Promise<DmResult> {
  const token = getBotToken();

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

  if (status === "cancelled") {
    return `**Order cancelled** (#${shortId})\nYour order has been cancelled.\nView your order: ${orderUrl}`;
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
  return sendDiscordDm(discordUserId, buildStatusMessage(orderId, status, options));
}

export type AdminOrderNotifyInput = {
  orderId: string;
  buyerUsername: string;
  total: number;
  currency: string;
  fulfillmentType: string;
  itemSummary: string;
};

export async function sendAdminNewOrderDm(
  input: AdminOrderNotifyInput,
): Promise<DmResult> {
  const adminId = getAdminDiscordId();
  if (!adminId) {
    return { ok: false, reason: "ADMIN_DISCORD_ID is not set" };
  }

  const orderUrl = `${getAppUrl()}/shop/orders/${input.orderId}`;
  const shortId = input.orderId.slice(0, 8);
  const content = [
    `**New order** (#${shortId})`,
    `Buyer: **${input.buyerUsername}**`,
    `Fulfillment: **${input.fulfillmentType}**`,
    `Items: ${input.itemSummary}`,
    `Total: **${input.total} ${input.currency}**`,
    `View: ${orderUrl}`,
  ].join("\n");

  return sendDiscordDm(adminId, content);
}

export async function sendAdminCancelledOrderDm(
  input: AdminOrderNotifyInput,
): Promise<DmResult> {
  const adminId = getAdminDiscordId();
  if (!adminId) {
    return { ok: false, reason: "ADMIN_DISCORD_ID is not set" };
  }

  const orderUrl = `${getAppUrl()}/shop/orders/${input.orderId}`;
  const shortId = input.orderId.slice(0, 8);
  const content = [
    `**Order cancelled** (#${shortId})`,
    `Buyer: **${input.buyerUsername}**`,
    `Fulfillment: **${input.fulfillmentType}**`,
    `Items: ${input.itemSummary}`,
    `Total: **${input.total} ${input.currency}**`,
    `View: ${orderUrl}`,
  ].join("\n");

  return sendDiscordDm(adminId, content);
}
