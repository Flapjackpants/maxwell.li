import { eq } from "drizzle-orm";
import { RetroShell } from "./components/RetroShell";
import { ListingCard, ShopErrorBanner } from "./components/ListingCard";
import { AdminLoginPrompt } from "./components/ShopAuthBar";
import { db } from "@/lib/db";
import { listings } from "@/lib/db/schema";
import { retroTableBorder } from "@/lib/retro-theme";
import { getCurrency } from "@/lib/shop/constants";
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
  admin_required:
    "You must log in with Discord (admin account) to access the admin area.",
};

function safeReturnTo(value: string | undefined): string {
  if (value?.startsWith("/") && !value.startsWith("//")) return value;
  return "/admin/orders";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; invite?: string; returnTo?: string }>;
}) {
  const params = await searchParams;
  const loginReturnTo = safeReturnTo(params.returnTo);
  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.inStock, true))
    .orderBy(listings.name);

  const catalog = rows.map(mapListing);
  const errorMsg = params.error ? ERROR_MESSAGES[params.error] : null;
  const currency = getCurrency();

  return (
    <RetroShell
      title="SQUING SHOP"
      subtitle="the most UMAZING shopping experience"
    >
      {errorMsg ? <ShopErrorBanner message={errorMsg} /> : null}
      {params.error === "admin_required" ? (
        <AdminLoginPrompt returnTo={loginReturnTo} />
      ) : null}
      {params.error === "not_in_guild" && params.invite ? (
        <p style={{ textAlign: "center" }}>
          <a href={params.invite} style={{ color: "#00ff00", fontWeight: "bold" }}>
            &gt;&gt; JOIN DISCORD SERVER &lt;&lt;
          </a>
        </p>
      ) : null}

      {catalog.length === 0 ? (
        <p style={{ textAlign: "center" }}>No items in stock right now. Check back later.</p>
      ) : (
        <table width="100%" cellPadding={6} style={retroTableBorder}>
          <tbody>
            {catalog.map((listing) => (
              <ListingCard key={listing.id} listing={listing} currency={currency} />
            ))}
          </tbody>
        </table>
      )}
    </RetroShell>
  );
}
