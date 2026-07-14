"use client";

import { useMemo, useState } from "react";
import { retroInputStyle } from "@/lib/retro-theme";
import type { Listing } from "@/lib/shop/types";
import { ListingCard } from "./ListingCard";
import { MaterialListImport } from "./MaterialListImport";
import styles from "./shop-catalog.module.css";

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

  const featured = useMemo(
    () => filtered.filter((listing) => listing.specialOffer),
    [filtered],
  );
  const regulars = useMemo(
    () => filtered.filter((listing) => !listing.specialOffer),
    [filtered],
  );

  return (
    <>
      <MaterialListImport listings={listings} />

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
        <>
          {featured.length > 0 ? (
            <section className={styles.specialSection}>
              <h2 className={styles.sectionTitle}>:: SPECIAL OFFERS ::</h2>
              <div className={styles.grid}>
                {featured.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    currency={currency}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {regulars.length > 0 ? (
            <section className={styles.catalogSection}>
              <div className={styles.grid}>
                {regulars.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    currency={currency}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </>
  );
}
