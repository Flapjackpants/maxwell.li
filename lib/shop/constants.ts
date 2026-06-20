export const MINECRAFT_DIMENSIONS = [
  { value: "overworld", label: "Overworld" },
  { value: "nether", label: "The Nether" },
  { value: "the_end", label: "The End" },
] as const;

export type MinecraftDimension = (typeof MINECRAFT_DIMENSIONS)[number]["value"];

export function getPickupLocation(): string {
  return process.env.SHOP_PICKUP_LOCATION ?? "Spawn shop chest";
}

export function getDeliveryFee(): number {
  const fee = Number(process.env.SHOP_DELIVERY_FEE ?? "50");
  return Number.isFinite(fee) ? fee : 50;
}

export const PAYMENT_INSTRUCTIONS =
  "Pay in-game (diamonds / emeralds / agreed currency) or via Venmo/PayPal as discussed on Discord. Your order stays PENDING PAYMENT until an admin confirms payment.";

export const DISCORD_INVITE_URL =
  process.env.DISCORD_INVITE_URL ?? "https://discord.gg/";
