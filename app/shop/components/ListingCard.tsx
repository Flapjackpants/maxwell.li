"use client";

import { retroBtnStyle, retroLinkStyle } from "@/lib/retro-theme";
import type { Listing } from "@/lib/shop/types";
import { useCart } from "./CartProvider";

type Props = {
  listing: Listing;
};

export function ListingCard({ listing }: Props) {
  const { addItem } = useCart();

  return (
    <tr>
      <td width="120" valign="top" style={{ backgroundColor: "#111166" }}>
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.name}
            width={100}
            height={100}
            style={{ border: "2px solid lime", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 100,
              height: 100,
              background: "#222",
              border: "2px solid lime",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
            }}
          >
            NO IMG
          </div>
        )}
      </td>
      <td valign="top" style={{ backgroundColor: "#0a0a44" }}>
        <b style={{ fontSize: "17px", color: "#ff6600" }}>{listing.name}</b>
        {!listing.inStock ? (
          <span style={{ color: "#f00", marginLeft: 8 }}>[OUT OF STOCK]</span>
        ) : (
          <span style={{ color: "#0f0", marginLeft: 8 }}>[IN STOCK]</span>
        )}
        <p>{listing.description}</p>
        <p>
          <b>Price:</b> {listing.price} emeralds
        </p>
        <button
          type="button"
          style={{
            ...retroBtnStyle,
            opacity: listing.inStock ? 1 : 0.5,
          }}
          disabled={!listing.inStock}
          onClick={() => addItem(listing.id, 1)}
        >
          [ ADD 2 CART ]
        </button>
      </td>
    </tr>
  );
}

export function ShopErrorBanner({ message }: { message: string }) {
  return (
    <p style={{ color: "#f00", textAlign: "center", fontWeight: "bold" }}>
      {message}
    </p>
  );
}

export function DiscordLoginButton({
  returnTo,
  label = "[ CONTINUE WITH DISCORD ]",
}: {
  returnTo: string;
  label?: string;
}) {
  const href = `/api/auth/discord?returnTo=${encodeURIComponent(returnTo)}`;
  return (
    <a href={href} style={{ ...retroLinkStyle, fontSize: 18 }}>
      {label}
    </a>
  );
}
