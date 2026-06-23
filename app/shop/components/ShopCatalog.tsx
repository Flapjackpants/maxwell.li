"use client";

import { useMemo, useState } from "react";
import { retroInputStyle } from "@/lib/retro-theme";
import type { Listing } from "@/lib/shop/types";
import { ListingCard } from "./ListingCard";

type Props = {
  listings: Listing[];
  currency: string;
};

export function ShopCatalog({ listings, currency }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter(
      (listing) =>
        listing.name.toLowerCase().includes(q) ||
        listing.description.toLowerCase().includes(q),
    );
  }, [listings, query]);

  return (
    <>
      <p style={{ textAlign: "center", marginBottom: 16 }}>
        <label>
          <span style={{ color: "#0ff", fontWeight: "bold" }}>Search: </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="item name or description..."
            style={{ ...retroInputStyle, width: "min(100%, 280px)" }}
          />
        </label>
      </p>

      {filtered.length === 0 ? (
        <p style={{ textAlign: "center" }}>
          {query.trim()
            ? `No items match "${query.trim()}"`
            : "No items in stock right now. Check back later."}
        </p>
      ) : (
        <div>
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              currency={currency}
            />
          ))}
        </div>
      )}
    </>
  );
}
