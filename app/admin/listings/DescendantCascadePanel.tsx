"use client";

import { useCallback, useEffect, useState } from "react";
import { retroBtnStyle, retroTableBorder } from "@/lib/retro-theme";
import {
  formatListingPrice,
  listingPrice,
  type PriceUnit,
} from "@/lib/shop/pricing";
import type {
  DescendantCascadeAction,
  DescendantSuggestion,
} from "@/lib/shop/listing-descendants";

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
    "Crafted items may need new prices. Apply a wave, then recalculate again for deeper recipes (e.g. planks → stairs).",
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
  onRefreshListings: () => void | Promise<void>;
}) {
  const [suggestions, setSuggestions] = useState<DescendantSuggestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [skipInitial, setSkipInitial] = useState(false);

  const loadFresh = useCallback(async () => {
    if (!cascade) {
      setSuggestions([]);
      setSelected(new Set());
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/listings/${cascade.sourceListingId}/descendants?action=${cascade.action}`,
        { credentials: "include", cache: "no-store" },
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
    setSkipInitial(false);
    setStatusMessage(null);
  }, [cascade?.sourceListingId, cascade?.action]);

  useEffect(() => {
    if (!cascade) {
      setSuggestions([]);
      setSelected(new Set());
      return;
    }

    if (!skipInitial && cascade.initialSuggestions) {
      setSuggestions(cascade.initialSuggestions);
      setSelected(
        new Set(cascade.initialSuggestions.map((entry) => entry.listingId)),
      );
      return;
    }

    void loadFresh();
  }, [cascade, skipInitial, loadFresh]);

  if (!cascade) return null;

  async function applySelected() {
    if (selected.size === 0) return;
    setApplying(true);
    setError(null);
    setStatusMessage(null);
    try {
      const res = await fetch(
        `/api/listings/${cascade!.sourceListingId}/descendants`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: cascade!.action,
            listingIds: [...selected],
          }),
        },
      );
      if (!res.ok) {
        setError("Update failed.");
        return;
      }

      const data = (await res.json()) as {
        updated?: number[];
        remaining?: number;
      };
      await onRefreshListings();

      if (cascade!.action === "reprice") {
        setSkipInitial(true);
        setStatusMessage(
          `Updated ${data.updated?.length ?? selected.size} listing(s).`,
        );
        setLoading(true);
        try {
          const nextRes = await fetch(
            `/api/listings/${cascade!.sourceListingId}/descendants?action=reprice`,
            { credentials: "include", cache: "no-store" },
          );
          if (nextRes.ok) {
            const nextData = (await nextRes.json()) as {
              suggestions: DescendantSuggestion[];
            };
            setSuggestions(nextData.suggestions);
            setSelected(
              new Set(nextData.suggestions.map((entry) => entry.listingId)),
            );
            if (nextData.suggestions.length === 0) {
              setStatusMessage(
                `Updated ${data.updated?.length ?? selected.size} listing(s). All descendant prices are up to date.`,
              );
            } else {
              setStatusMessage(
                `Updated ${data.updated?.length ?? selected.size} listing(s). ${nextData.suggestions.length} further descendant(s) can be recalculated with the new prices.`,
              );
            }
          }
        } finally {
          setLoading(false);
        }
        return;
      }

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

        {statusMessage ? (
          <p style={{ fontSize: 13, color: "#0f0", margin: "0 0 8px" }}>
            {statusMessage}
          </p>
        ) : null}

        {loading ? (
          <p style={{ fontSize: 13, color: "#aaa" }}>Loading descendants...</p>
        ) : suggestions.length === 0 ? (
          <p style={{ fontSize: 13, color: "#888" }}>
            {cascade.action === "reprice"
              ? "No further price changes needed for descendants."
              : "No descendant listings found."}
            <button
              type="button"
              onClick={onDone}
              style={{ ...retroBtnStyle, marginLeft: 8, fontSize: 11 }}
            >
              [ DISMISS ]
            </button>
            {cascade.action === "reprice" ? (
              <>
                {" "}
                <button
                  type="button"
                  style={{ ...retroBtnStyle, fontSize: 11 }}
                  onClick={() => {
                    setSkipInitial(true);
                    setStatusMessage(null);
                    void loadFresh();
                  }}
                >
                  [ CHECK AGAIN ]
                </button>
              </>
            ) : null}
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
                                    perCount:
                                      suggestion.suggestedPricePerCount ?? 1,
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
              {cascade.action === "reprice" ? (
                <button
                  type="button"
                  style={retroBtnStyle}
                  disabled={applying || loading}
                  onClick={() => {
                    setSkipInitial(true);
                    setStatusMessage(null);
                    void loadFresh();
                  }}
                >
                  [ RECALCULATE AGAIN ]
                </button>
              ) : null}{" "}
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
