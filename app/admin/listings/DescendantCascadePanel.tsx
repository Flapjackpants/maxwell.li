"use client";

import { useCallback, useEffect, useState } from "react";
import { retroBtnStyle, retroTableBorder } from "@/lib/retro-theme";
import {
  formatListingPrice,
  listingPrice,
  type PriceUnit,
} from "@/lib/shop/pricing";
import type { DescendantCascadeAction, DescendantSuggestion } from "@/lib/shop/listing-descendants";

type CascadeState = {
  action: DescendantCascadeAction;
  sourceListingId: number;
  sourceName: string;
  initialSuggestions?: DescendantSuggestion[];
};

const ACTION_LABELS: Record<DescendantCascadeAction, string> = {
  reprice: "Recalculate prices",
  offsale: "Take off sale",
  delete: "Delete",
};

const ACTION_DESCRIPTIONS: Record<DescendantCascadeAction, string> = {
  reprice:
    "These crafted items may need new prices based on your ingredient change.",
  offsale: "These crafted items also use the item you took off sale.",
  delete: "These crafted items depend on the item you deleted.",
};

export function DescendantCascadePanel({
  cascade,
  currency,
  onDone,
  onRefreshListings,
}: {
  cascade: CascadeState | null;
  currency: string;
  onDone: () => void;
  onRefreshListings: () => void;
}) {
  const [suggestions, setSuggestions] = useState<DescendantSuggestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!cascade) {
      setSuggestions([]);
      setSelected(new Set());
      return;
    }

    if (cascade.initialSuggestions) {
      setSuggestions(cascade.initialSuggestions);
      setSelected(
        new Set(cascade.initialSuggestions.map((entry) => entry.listingId)),
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/listings/${cascade.sourceListingId}/descendants?action=${cascade.action}`,
      );
      if (!res.ok) {
        setSuggestions([]);
        return;
      }
      const data = (await res.json()) as { suggestions: DescendantSuggestion[] };
      setSuggestions(data.suggestions);
      setSelected(new Set(data.suggestions.map((entry) => entry.listingId)));
    } catch {
      setSuggestions([]);
      setError("Could not load descendant suggestions.");
    } finally {
      setLoading(false);
    }
  }, [cascade]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!cascade) return null;

  async function applySelected() {
    if (selected.size === 0) return;
    setApplying(true);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${cascade!.sourceListingId}/descendants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: cascade!.action,
          listingIds: [...selected],
        }),
      });
      if (!res.ok) {
        setError("Update failed.");
        return;
      }
      onRefreshListings();
      onDone();
    } catch {
      setError("Update failed.");
    } finally {
      setApplying(false);
    }
  }

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <fieldset style={{ border: "2px ridge #ff0", padding: 8 }}>
        <legend>Descendant items — {ACTION_LABELS[cascade.action]}</legend>
        <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 8px" }}>
          After changing <b style={{ color: "#ff0" }}>{cascade.sourceName}</b>:{" "}
          {ACTION_DESCRIPTIONS[cascade.action]}
        </p>

        {loading ? (
          <p style={{ fontSize: 13, color: "#aaa" }}>Loading descendants...</p>
        ) : suggestions.length === 0 ? (
          <p style={{ fontSize: 13, color: "#888" }}>
            No descendant listings found.
            <button
              type="button"
              onClick={onDone}
              style={{ ...retroBtnStyle, marginLeft: 8, fontSize: 11 }}
            >
              [ DISMISS ]
            </button>
          </p>
        ) : (
          <>
            <table width="100%" cellPadding={6} style={retroTableBorder}>
              <tbody>
                {suggestions.map((suggestion) => (
                  <tr key={suggestion.listingId}>
                    <td style={{ backgroundColor: "#0a0a44", fontSize: 13 }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selected.has(suggestion.listingId)}
                          onChange={() => toggle(suggestion.listingId)}
                        />{" "}
                        <b style={{ color: "#0ff" }}>{suggestion.name}</b>
                        {suggestion.depth > 1 ? (
                          <span style={{ color: "#888" }}>
                            {" "}
                            (tier {suggestion.depth})
                          </span>
                        ) : null}
                      </label>
                      <br />
                      {cascade.action === "reprice" ? (
                        <>
                          <span style={{ color: "#888" }}>
                            Current:{" "}
                            {formatListingPrice(
                              listingPrice({
                                price: suggestion.currentPrice,
                                priceUnit: suggestion.currentPriceUnit,
                                pricePerCount: suggestion.currentPricePerCount,
                              }),
                              currency,
                            )}
                          </span>
                          <br />
                          <span style={{ color: "#ff0" }}>
                            Suggested:{" "}
                            {suggestion.suggestedPrice !== undefined
                              ? formatListingPrice(
                                  {
                                    amount: suggestion.suggestedPrice,
                                    unit: (suggestion.suggestedPriceUnit ??
                                      "item") as PriceUnit,
                                    perCount: suggestion.suggestedPricePerCount ?? 1,
                                  },
                                  currency,
                                )
                              : "—"}
                          </span>
                        </>
                      ) : cascade.action === "offsale" ? (
                        <span style={{ color: "#f00" }}>Currently in stock</span>
                      ) : (
                        <span style={{ color: "#ccc" }}>Listed crafted item</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {error ? <p style={{ color: "#f00" }}>{error}</p> : null}
            <p style={{ marginTop: 8 }}>
              <button
                type="button"
                style={retroBtnStyle}
                disabled={applying || selected.size === 0}
                onClick={() => void applySelected()}
              >
                {applying
                  ? "[ WORKING... ]"
                  : `[ ${ACTION_LABELS[cascade.action].toUpperCase()} SELECTED ]`}
              </button>{" "}
              <button type="button" style={retroBtnStyle} onClick={onDone}>
                [ DISMISS ]
              </button>
            </p>
          </>
        )}
      </fieldset>
    </div>
  );
}

export type { CascadeState as DescendantCascadeState };
