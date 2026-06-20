import { eq } from "drizzle-orm";
import { RetroShell } from "./components/RetroShell";
import { ListingCard } from "./components/ListingCard";
import { ShopErrorBanner } from "./components/ListingCard";
import { db } from "@/lib/db";
import { listings } from "@/lib/db/schema";
import { retroTableBorder } from "@/lib/retro-theme";
import type { Listing } from "@/lib/shop/types";

function mapListing(row: typeof listings.$inferSelect): Listing {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    imageUrl: row.imageUrl,
    inStock: row.inStock,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const ERROR_MESSAGES: Record<string, string> = {
  discord_denied: "Discord login was cancelled.",
  not_in_guild:
    "You must join our Discord server before shopping! Check the invite link below.",
  auth_failed: "Login failed. Please try again.",
  admin_required: "Admin access required.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; invite?: string }>;
}) {
  const params = await searchParams;
  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.inStock, true))
    .orderBy(listings.name);

  const catalog = rows.map(mapListing);
  const errorMsg = params.error ? ERROR_MESSAGES[params.error] : null;

  return (
    <RetroShell
      title="~*~ SQUING SHOP ~*~"
      subtitle="Official server marketplace — best deals on the block!!!"
    >
      {errorMsg ? <ShopErrorBanner message={errorMsg} /> : null}
      {params.error === "not_in_guild" && params.invite ? (
        <p style={{ textAlign: "center" }}>
          <a href={params.invite} style={{ color: "#00ff00", fontWeight: "bold" }}>
            &gt;&gt; JOIN DISCORD SERVER &lt;&lt;
          </a>
        </p>
      ) : null}

      {catalog.length === 0 ? (
        <p style={{ textAlign: "center" }}>No items in stock right now. Check back!!!</p>
      ) : (
        <table width="100%" cellPadding={6} style={retroTableBorder}>
          <tbody>
            {catalog.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </tbody>
        </table>
      )}
    </RetroShell>
  );
}
