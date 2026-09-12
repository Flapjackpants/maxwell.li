"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RetroShell } from "../components/RetroShell";
import { useCart } from "../components/CartProvider";
import {
  MinecraftQuantityInputs,
  MinecraftQuantityLabel,
} from "../components/MinecraftQuantityInputs";
import {
  cartSubtotal,
  formatListingPrice,
  listingPrice,
} from "@/lib/shop/pricing";
import { clampPurchaseQuantity } from "@/lib/shop/purchase-limit";
import { retroBtnStyle, retroLinkStyle, retroTableBorder } from "@/lib/retro-theme";
import type { Listing } from "@/lib/shop/types";

export default function CartPage() {
  const { items, setQuantity, removeItem, itemCount, storeOpen, openShopClosedModal } = useCart();
  const [listings, setListings] = useState<Listing[]>([]);
  const [currency, setCurrency] = useState("emeralds");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [listingsRes, configRes] = await Promise.all([
        fetch("/api/listings"),
        fetch("/api/shop/config"),
      ]);
      if (listingsRes.ok) setListings(await listingsRes.json());
      if (configRes.ok) {
        const config = (await configRes.json()) as { currency: string };
        setCurrency(config.currency);
      }
      setLoading(false);
    })();
  }, []);

  const listingMap = new Map(listings.map((l) => [l.id, l]));
  const subtotal = cartSubtotal(
    items
      .map((item) => {
        const listing = listingMap.get(item.listingId);
        if (!listing) return null;
        return { quantity: item.quantity, price: listingPrice(listing) };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null),
  );

  return (
    <RetroShell title="YOUR CART" subtitle={`${itemCount} item(s) total`} showAudio={false}>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p style={{ textAlign: "center" }}>
          Cart is empty!{" "}
          <Link href="/shop" style={retroLinkStyle}>
            Go shopping
          </Link>
        </p>
      ) : (
        <>
          {!storeOpen ? (
            <div
              style={{
                textAlign: "center",
                margin: "12px 0",
                padding: 8,
                border: "2px solid #f00",
                backgroundColor: "#330000",
              }}
            >
              <b style={{ color: "#ff4444" }}>THE SHOP IS CURRENTLY CLOSED</b>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#fff" }}>
                You cannot add items or check out until the shop reopens.
              </p>
            </div>
          ) : null}
          <table width="100%" cellPadding={6} style={retroTableBorder}>
            <tbody>
              {items.map((item) => {
                const listing = listingMap.get(item.listingId);
                if (!listing) return null;
                return (
                  <tr key={item.listingId}>
                    <td style={{ backgroundColor: "#0a0a44" }}>
                      <b>{listing.name}</b> —{" "}
                      {formatListingPrice(listingPrice(listing), currency)}
                      <br />
                      <MinecraftQuantityLabel total={item.quantity} />
                      <br />
                      <MinecraftQuantityInputs
                        total={item.quantity}
                        compact
                        onChange={(total) => {
                          const capped = clampPurchaseQuantity(listing, total);
                          if (capped <= 0) removeItem(item.listingId);
                          else setQuantity(item.listingId, capped);
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
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p style={{ textAlign: "right", fontSize: 18 }}>
            <b>
              Subtotal: {subtotal} {currency}
            </b>
          </p>
          <center>
            {storeOpen ? (
              <Link href="/shop/checkout" style={{ ...retroLinkStyle, fontSize: 18 }}>
                [ PROCEED TO CHECKOUT ]
              </Link>
            ) : (
              <button
                type="button"
                onClick={openShopClosedModal}
                style={{
                  ...retroBtnStyle,
                  fontSize: 18,
                  background: "#cc0000",
                  color: "#ffffff",
                  borderColor: "#ff6666",
                }}
              >
                [ SHOP CLOSED — CANNOT CHECKOUT ]
              </button>
            )}
          </center>
        </>
      )}
    </RetroShell>
  );
}
