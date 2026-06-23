export const MINECRAFT_DIMENSIONS = [
  { value: "overworld", label: "Overworld" },
] as const;

export type MinecraftDimension = (typeof MINECRAFT_DIMENSIONS)[number]["value"];

export function getCurrency(): string {
  return process.env.SHOP_CURRENCY ?? "emeralds";
}

export function getDeliveryFeePercent(): number {
  const pct = Number(process.env.SHOP_DELIVERY_FEE_PERCENT ?? "10");
  return Number.isFinite(pct) && pct >= 0 ? pct : 10;
}

export function calculateDeliveryFee(subtotal: number): number {
  return Math.round((subtotal * getDeliveryFeePercent()) / 100);
}

export const PAYMENT_INSTRUCTIONS =
  "Pay in-game with the agreed currency in the same chest you receieved your items. DM Flapjackpants when you have paid. Your order will be completed once payment is confirmed.";

export const DISCORD_INVITE_URL =
  process.env.DISCORD_INVITE_URL ?? "https://discord.gg/";
