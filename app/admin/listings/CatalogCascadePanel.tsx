"use client";

import { useCallback, useEffect, useState } from "react";
import { retroBtnStyle, retroTableBorder } from "@/lib/retro-theme";
import {
  formatListingPrice,
  listingPrice,
  type PriceUnit,
} from "@/lib/shop/pricing";
import type { DescendantSuggestion } from "@/lib/shop/listing-descendants";

export function CatalogCascadePanel({
  open,
  currency,
  onDone,
  onRefreshListings,
}: {
  open: boolean;
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

  const loadFresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/listings/price-cascade", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setSuggestions([]);
        setError("Could not load price suggestions.");
        return;
      }
      const data = (await res.json()) as { suggestions: DescendantSuggestion[] };
      setSuggestions(data.suggestions);
      setSelected(new Set(data.suggestions.map((entry) => entry.listingId)));
    } catch {
      setSuggestions([]);
      setError("Could not load price suggestions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setSuggestions([]);
      setSelected(new Set());
      setStatusMessage(null);
      setError(null);
      return;
    }
    setStatusMessage(null);
    void loadFresh();
  }, [open, loadFresh]);

  if (!open) return null;

  async function applySelected() {
    if (selected.size === 0) return;
    setApplying(true);
    setError(null);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/listings/price-cascade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listingIds: [...selected] }),
      });
      if (!res.ok) {
        setError("Update failed.");
        return;
      }

      const data = (await res.json()) as {
        updated?: number[];
        remaining?: number;
      };
      await onRefreshListings();

      setLoading(true);
      try {
        const nextRes = await fetch("/api/listings/price-cascade", {
          credentials: "include",
          cache: "no-store",
        });
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
              `Updated ${data.updated?.length ?? selected.size} listing(s). All listed craft prices are up to date.`,
            );
          } else {
            setStatusMessage(
              `Updated ${data.updated?.length ?? selected.size} listing(s). ${nextData.suggestions.length} further listing(s) can be lowered with the new prices.`,
            );
          }
        }
      } finally {
        setLoading(false);
      }
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
      <fieldset style={{ border: "2px ridge #0ff", padding: 8 }}>
        <legend>Catalog price cascade</legend>
        <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 8px" }}>
          Listed items whose craft recipe implies a{" "}
          <b style={{ color: "#ff0" }}>lower</b> price than currently set. Apply a
          wave, then recalculate for deeper recipes.
        </p>

        {statusMessage ? (
          <p style={{ fontSize: 13, color: "#0f0", margin: "0 0 8px" }}>
            {statusMessage}
          </p>
        ) : null}

        {loading ? (
          <p style={{ fontSize: 13, color: "#aaa" }}>Scanning listings...</p>
        ) : suggestions.length === 0 ? (
          <p style={{ fontSize: 13, color: "#888" }}>
            No lower craft-based price recommendations right now.
            <button
              type="button"
              onClick={onDone}
              style={{ ...retroBtnStyle, marginLeft: 8, fontSize: 11 }}
            >
              [ DISMISS ]
            </button>{" "}
            <button
              type="button"
              style={{ ...retroBtnStyle, fontSize: 11 }}
              onClick={() => {
                setStatusMessage(null);
                void loadFresh();
              }}
            >
              [ CHECK AGAIN ]
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
                        {suggestion.depth > 0 ? (
                          <span style={{ color: "#888" }}>
                            {" "}
                            (tier {suggestion.depth})
                          </span>
                        ) : null}
                      </label>
                      <br />
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
                  : `[ APPLY LOWER PRICES (${selected.size}) ]`}
              </button>{" "}
              <button
                type="button"
                style={retroBtnStyle}
                disabled={applying || loading}
                onClick={() => {
                  setStatusMessage(null);
                  void loadFresh();
                }}
              >
                [ RECALCULATE AGAIN ]
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
