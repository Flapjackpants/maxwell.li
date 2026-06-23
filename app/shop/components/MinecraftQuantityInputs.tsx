"use client";

import { useId } from "react";
import { retroInputStyle } from "@/lib/retro-theme";
import {
  formatQuantityBreakdown,
  fromAbsoluteQuantity,
  parseQuantityFields,
  toAbsoluteQuantity,
  type MinecraftQuantityBreakdown,
} from "@/lib/shop/minecraft-quantity";

type Props = {
  total: number;
  onChange: (total: number) => void;
  compact?: boolean;
};

export function MinecraftQuantityInputs({ total, onChange, compact }: Props) {
  const id = useId();
  const breakdown = fromAbsoluteQuantity(total);
  const inputStyle = { ...retroInputStyle, width: compact ? 48 : 56 };

  function update(field: keyof MinecraftQuantityBreakdown, value: string) {
    const parsed = parseQuantityFields(
      field === "chests" ? value : String(breakdown.chests),
      field === "stacks" ? value : String(breakdown.stacks),
      field === "items" ? value : String(breakdown.items),
    );
    onChange(toAbsoluteQuantity(parsed));
  }

  return (
    <span
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
      }}
    >
      <label htmlFor={`${id}-chests`}>
        Chests:{" "}
        <input
          id={`${id}-chests`}
          type="number"
          min={0}
          value={breakdown.chests}
          style={inputStyle}
          onChange={(e) => update("chests", e.target.value)}
        />
      </label>
      <label htmlFor={`${id}-stacks`}>
        Stacks:{" "}
        <input
          id={`${id}-stacks`}
          type="number"
          min={0}
          value={breakdown.stacks}
          style={inputStyle}
          onChange={(e) => update("stacks", e.target.value)}
        />
      </label>
      <label htmlFor={`${id}-items`}>
        Items:{" "}
        <input
          id={`${id}-items`}
          type="number"
          min={0}
          value={breakdown.items}
          style={inputStyle}
          onChange={(e) => update("items", e.target.value)}
        />
      </label>
    </span>
  );
}

export function MinecraftQuantityLabel({ total }: { total: number }) {
  return (
    <span style={{ color: "#0ff", fontSize: 13 }}>
      {formatQuantityBreakdown(total)}
    </span>
  );
}
