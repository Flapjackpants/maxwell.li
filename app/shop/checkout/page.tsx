"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RetroShell } from "../components/RetroShell";
import { useCart } from "../components/CartProvider";
import { DiscordLoginButton } from "../components/ShopAuthBar";
import {
  retroBtnStyle,
  retroInputStyle,
  retroLinkStyle,
  retroSelectStyle,
  retroTableBorder,
} from "@/lib/retro-theme";
import { MINECRAFT_DIMENSIONS } from "@/lib/shop/constants";
import type { Listing } from "@/lib/shop/types";

type ShopConfig = {
  pickupLocation: string;
  deliveryFee: number;
};

type SessionInfo = {
  userId: number;
  username: string;
  isAdmin: boolean;
} | null;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [listings, setListings] = useState<Listing[]>([]);
  const [session, setSession] = useState<SessionInfo | undefined>(undefined);
  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [deliveryX, setDeliveryX] = useState("0");
  const [deliveryY, setDeliveryY] = useState("64");
  const [deliveryZ, setDeliveryZ] = useState("0");
  const [deliveryDimension, setDeliveryDimension] = useState("overworld");
  const [shopConfig, setShopConfig] = useState<ShopConfig>({
    pickupLocation: "Spawn shop chest",
    deliveryFee: 50,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/listings")
      .then((r) => r.json())
      .then((data: Listing[]) => setListings(data));
  }, []);

  useEffect(() => {
    fetch("/api/shop/config")
      .then((r) => r.json())
      .then((data: ShopConfig) => setShopConfig(data));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSession(data))
      .catch(() => setSession(null));
  }, []);

  const listingMap = new Map(listings.map((l) => [l.id, l]));
  const subtotal = items.reduce((sum, item) => {
    const listing = listingMap.get(item.listingId);
    return sum + (listing?.price ?? 0) * item.quantity;
  }, 0);
  const deliveryFee =
    fulfillmentType === "delivery" ? shopConfig.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          fulfillmentType,
          ...(fulfillmentType === "delivery"
            ? {
                deliveryX: Number(deliveryX),
                deliveryY: Number(deliveryY),
                deliveryZ: Number(deliveryZ),
                deliveryDimension,
              }
            : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed");
        return;
      }

      clearCart();
      router.push(`/shop/orders/${data.id}`);
    } catch {
      setError("Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (session === undefined) {
    return (
      <RetroShell title="CHECKOUT">
        <p>Loading...</p>
      </RetroShell>
    );
  }

  if (!session) {
    return (
      <RetroShell title="CHECKOUT">
        <p style={{ textAlign: "center" }}>
          U must log in with Discord 2 checkout!!!
        </p>
        <center>
          <DiscordLoginButton returnTo="/shop/checkout" />
        </center>
      </RetroShell>
    );
  }

  if (items.length === 0) {
    return (
      <RetroShell title="CHECKOUT">
        <p style={{ textAlign: "center" }}>
          Cart is empty.{" "}
          <a href="/shop" style={retroLinkStyle}>
            Go shopping
          </a>
        </p>
      </RetroShell>
    );
  }

  return (
    <RetroShell
      title="CHECKOUT"
      subtitle={`Logged in as ${session.username}`}
    >
      <form onSubmit={handleSubmit}>
        <table width="100%" cellPadding={6} style={retroTableBorder}>
          <tbody>
            {items.map((item) => {
              const listing = listingMap.get(item.listingId);
              if (!listing) return null;
              return (
                <tr key={item.listingId}>
                  <td style={{ backgroundColor: "#0a0a44" }}>
                    {listing.name} x{item.quantity}
                  </td>
                  <td align="right">{listing.price * item.quantity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p>
          <b>Fulfillment:</b>
          <br />
          <label>
            <input
              type="radio"
              name="fulfillment"
              checked={fulfillmentType === "pickup"}
              onChange={() => setFulfillmentType("pickup")}
            />{" "}
            Pickup at <b>{shopConfig.pickupLocation}</b>
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="fulfillment"
              checked={fulfillmentType === "delivery"}
              onChange={() => setFulfillmentType("delivery")}
            />{" "}
            Delivery (+{shopConfig.deliveryFee} emeralds flat fee)
          </label>
        </p>

        {fulfillmentType === "delivery" ? (
          <fieldset style={{ border: "2px ridge #f0f", padding: 8 }}>
            <legend>Delivery coordinates</legend>
            <label>
              X:{" "}
              <input
                type="number"
                value={deliveryX}
                onChange={(e) => setDeliveryX(e.target.value)}
                style={retroInputStyle}
                required
              />
            </label>{" "}
            <label>
              Y:{" "}
              <input
                type="number"
                value={deliveryY}
                onChange={(e) => setDeliveryY(e.target.value)}
                style={retroInputStyle}
                required
              />
            </label>{" "}
            <label>
              Z:{" "}
              <input
                type="number"
                value={deliveryZ}
                onChange={(e) => setDeliveryZ(e.target.value)}
                style={retroInputStyle}
                required
              />
            </label>{" "}
            <label>
              Dimension:{" "}
              <select
                value={deliveryDimension}
                onChange={(e) => setDeliveryDimension(e.target.value)}
                style={retroSelectStyle}
              >
                {MINECRAFT_DIMENSIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
        ) : null}

        <p style={{ textAlign: "right", fontSize: 18 }}>
          {deliveryFee > 0 ? (
            <>
              Subtotal: {subtotal}
              <br />
              Delivery fee: {deliveryFee}
              <br />
            </>
          ) : null}
          <b>Total: {total} emeralds</b>
        </p>

        {error ? <p style={{ color: "#f00" }}>{error}</p> : null}

        <center>
          <button type="submit" style={retroBtnStyle} disabled={submitting}>
            {submitting ? "[ PLACING ORDER... ]" : "[ PLACE ORDER ]"}
          </button>
        </center>
      </form>
    </RetroShell>
  );
}
