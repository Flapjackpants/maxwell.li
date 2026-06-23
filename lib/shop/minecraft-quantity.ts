export const ITEMS_PER_STACK = 64;
export const STACKS_PER_CHEST = 27;
export const ITEMS_PER_CHEST = ITEMS_PER_STACK * STACKS_PER_CHEST;

export type MinecraftQuantityBreakdown = {
  chests: number;
  stacks: number;
  items: number;
};

export function toAbsoluteQuantity(
  breakdown: MinecraftQuantityBreakdown,
): number {
  return (
    breakdown.chests * ITEMS_PER_CHEST +
    breakdown.stacks * ITEMS_PER_STACK +
    breakdown.items
  );
}

export function fromAbsoluteQuantity(total: number): MinecraftQuantityBreakdown {
  const safe = Math.max(0, Math.floor(total));
  const chests = Math.floor(safe / ITEMS_PER_CHEST);
  let remainder = safe % ITEMS_PER_CHEST;
  const stacks = Math.floor(remainder / ITEMS_PER_STACK);
  remainder = remainder % ITEMS_PER_STACK;
  return { chests, stacks, items: remainder };
}

function pluralize(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

export function formatQuantityBreakdown(total: number): string {
  const { chests, stacks, items } = fromAbsoluteQuantity(total);
  return [
    pluralize(chests, "chest"),
    pluralize(stacks, "stack"),
    pluralize(items, "item"),
  ].join(", ");
}

export function parseQuantityFields(
  chests: string,
  stacks: string,
  items: string,
): MinecraftQuantityBreakdown {
  return {
    chests: Math.max(0, Math.floor(Number(chests) || 0)),
    stacks: Math.max(0, Math.floor(Number(stacks) || 0)),
    items: Math.max(0, Math.floor(Number(items) || 0)),
  };
}
