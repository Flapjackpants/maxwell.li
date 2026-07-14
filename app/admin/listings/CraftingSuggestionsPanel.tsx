"use client";

import { useCallback, useEffect, useState } from "react";
import craftingData from "@/lib/shop/crafting-recipes.json";
import { retroBtnStyle, retroTableBorder } from "@/lib/retro-theme";
import {
  formatIngredientList,
  suggestionToListingPrice,
  type CraftingSuggestion,
} from "@/lib/shop/crafting-suggestions";
import { formatListingPrice, type PriceUnit } from "@/lib/shop/pricing";

type FormState = {
  name: string;
  description: string;
  price: string;
  priceUnit: PriceUnit;
  pricePerCount: string;
  purchaseLimitMode: "uncapped" | "capped";
  maxPurchaseQuantity: string;
  imageUrl: string;
  inStock: boolean;
  specialOffer: boolean;
};

export function CraftingSuggestionsPanel({
  currency,
  listingCount,
  onApply,
}: {
  currency: string;
  listingCount: number;
  onApply: (form: FormState) => void;
}) {
  const [suggestions, setSuggestions] = useState<CraftingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const load = useCallback(async () => {
    if (listingCount === 0) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/listings/crafting-suggestions", {
        credentials: "include",
      });
      if (!res.ok) {
        setSuggestions([]);
        return;
      }
      const data = (await res.json()) as { suggestions: CraftingSuggestion[] };
      setSuggestions(data.suggestions);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [listingCount]);

  useEffect(() => {
    void load();
  }, [load]);

  if (listingCount === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <fieldset style={{ border: "2px ridge #0ff", padding: 8 }}>
        <legend>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            style={{
              ...retroBtnStyle,
              fontSize: 12,
              padding: "2px 8px",
            }}
          >
            {expanded ? "[ - ]" : "[ + ]"}
          </button>{" "}
          Craftable suggestions
        </legend>
        {expanded ? (
          <>
            <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 8px" }}>
              Items craftable from ingredients on your listings. Recipes from
              official Minecraft {(craftingData as { minecraftVersion?: string }).minecraftVersion ?? "26.2"} data
              ({(craftingData as { recipeCount?: number }).recipeCount ?? "1000+"}{" "}
              crafting recipes). Prices use cheapest materials as 1 {currency} per N items.
            </p>
            {loading ? (
              <p style={{ fontSize: 13, color: "#aaa" }}>Loading recipes...</p>
            ) : suggestions.length === 0 ? (
              <p style={{ fontSize: 13, color: "#888" }}>
                No new craftable items — add more base materials or recipes may
                already be listed.
              </p>
            ) : (
              <table width="100%" cellPadding={6} style={retroTableBorder}>
                <tbody>
                  {suggestions.map((suggestion) => (
                    <tr key={suggestion.recipeId}>
                      <td style={{ backgroundColor: "#0a0a44", fontSize: 13 }}>
                        <b style={{ color: "#0ff" }}>{suggestion.name}</b>
                        {suggestion.outputCount > 1 ? (
                          <span style={{ color: "#888" }}>
                            {" "}
                            (×{suggestion.outputCount} per craft)
                          </span>
                        ) : null}
                        <br />
                        <span style={{ color: "#ccc" }}>
                          {formatIngredientList(suggestion.ingredients)}
                        </span>
                        <br />
                        <span style={{ color: "#ff0" }}>
                          {formatListingPrice(
                            suggestionToListingPrice(suggestion),
                            currency,
                          )}
                        </span>
                      </td>
                      <td valign="top">
                        <button
                          type="button"
                          style={retroBtnStyle}
                          onClick={() =>
                            onApply({
                              name: suggestion.name,
                              description: `Crafted from ${formatIngredientList(suggestion.ingredients)}.`,
                              price: String(suggestion.price),
                              priceUnit: suggestion.priceUnit,
                              pricePerCount: String(suggestion.pricePerCount),
                              purchaseLimitMode: "uncapped",
                              maxPurchaseQuantity: "64",
                              imageUrl: "",
                              inStock: true,
                              specialOffer: false,
                            })
                          }
                        >
                          [ ADD ]
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : null}
      </fieldset>
    </div>
  );
}

export type { FormState as CraftingSuggestionFormState };
