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

/** Re-insert a special offer every this many regular items (~2 rows at 3-wide). */
const SPECIAL_EVERY_N_REGULARS = 6;

type CatalogEntry = {
  key: string;
  listing: Listing;
};

function buildCatalogEntries(listings: Listing[]): {
  featured: CatalogEntry[];
  feed: CatalogEntry[];
} {
  const specials = listings.filter((listing) => listing.specialOffer);
  const regulars = listings.filter((listing) => !listing.specialOffer);

  const featured = specials.map((listing) => ({
    key: `featured-${listing.id}`,
    listing,
  }));

  const feed: CatalogEntry[] = [];
  let specialCursor = 0;

  regulars.forEach((listing, index) => {
    feed.push({ key: `regular-${listing.id}`, listing });

    if (
      specials.length > 0 &&
      (index + 1) % SPECIAL_EVERY_N_REGULARS === 0
    ) {
      const special = specials[specialCursor % specials.length]!;
      specialCursor += 1;
      feed.push({
        key: `repeat-${special.id}-${index}`,
        listing: special,
      });
    }
  });

  // If the catalog is mostly specials (few/no regulars), still show them.
  if (regulars.length === 0) {
    return { featured, feed: [] };
  }

  return { featured, feed };
}

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

  const { featured, feed } = useMemo(
    () => buildCatalogEntries(filtered),
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
                {featured.map((entry) => (
                  <ListingCard
                    key={entry.key}
                    listing={entry.listing}
                    currency={currency}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {feed.length > 0 ? (
            <section className={styles.catalogSection}>
              <div className={styles.grid}>
                {feed.map((entry) => (
                  <ListingCard
                    key={entry.key}
                    listing={entry.listing}
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
