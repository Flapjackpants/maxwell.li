"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RetroShell } from "../components/RetroShell";
import { useCart } from "../components/CartProvider";
import {
  MinecraftQuantityInputs,
  MinecraftQuantityLabel,
} from "../components/MinecraftQuantityInputs";
import { retroBtnStyle, retroLinkStyle, retroTableBorder } from "@/lib/retro-theme";
import type { Listing } from "@/lib/shop/types";

export default function CartPage() {
  const { items, setQuantity, removeItem, itemCount } = useCart();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/listings")
      .then((r) => r.json())
      .then((data: Listing[]) => setListings(data))
      .finally(() => setLoading(false));
  }, []);

  const listingMap = new Map(listings.map((l) => [l.id, l]));
  const subtotal = items.reduce((sum, item) => {
    const listing = listingMap.get(item.listingId);
    return sum + (listing?.price ?? 0) * item.quantity;
  }, 0);

  return (
    <RetroShell title="YOUR CART" subtitle={`${itemCount} item(s) total`}>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p style={{ textAlign: "center" }}>
          Cart is empty!!!{" "}
          <Link href="/shop" style={retroLinkStyle}>
            Go shopping
          </Link>
        </p>
      ) : (
        <>
          <table width="100%" cellPadding={6} style={retroTableBorder}>
            <tbody>
              {items.map((item) => {
                const listing = listingMap.get(item.listingId);
                if (!listing) return null;
                return (
                  <tr key={item.listingId}>
                    <td style={{ backgroundColor: "#0a0a44" }}>
                      <b>{listing.name}</b> — {listing.price} gold blocks/e-pearls per item
                      <br />
                      <MinecraftQuantityLabel total={item.quantity} />
                      <br />
                      <MinecraftQuantityInputs
                        total={item.quantity}
                        compact
                        onChange={(total) => {
                          if (total <= 0) removeItem(item.listingId);
                          else setQuantity(item.listingId, total);
                        }}
                      />{" "}
                      <button
                        type="button"
                        style={retroBtnStyle}
                        onClick={() => removeItem(item.listingId)}
                      >
                        [ REMOVE ]
                      </button>
                    </td>
                    <td align="right" style={{ backgroundColor: "#111166" }}>
                      {listing.price * item.quantity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p style={{ textAlign: "right", fontSize: 18 }}>
            <b>Subtotal: {subtotal} gold blocks/e-pearls</b>
          </p>
          <center>
            <Link href="/shop/checkout" style={{ ...retroLinkStyle, fontSize: 18 }}>
              [ PROCEED TO CHECKOUT ]
            </Link>
          </center>
        </>
      )}
    </RetroShell>
  );
}
