"use client";

import { useEffect, useState } from "react";
import {
  retroBtnStyle,
  retroInputStyle,
  retroSelectStyle,
  retroTableBorder,
} from "@/lib/retro-theme";
import {
  PRICE_UNITS,
  formatListingPrice,
  listingPrice,
  type PriceUnit,
} from "@/lib/shop/pricing";
import type { Listing } from "@/lib/shop/types";
import { formatPurchaseLimit } from "@/lib/shop/purchase-limit";
import {
  CraftingSuggestionsPanel,
  type CraftingSuggestionFormState,
} from "./CraftingSuggestionsPanel";

const emptyForm = {
  name: "",
  description: "",
  price: "0",
  priceUnit: "stack" as PriceUnit,
  pricePerCount: "1",
  purchaseLimitMode: "uncapped" as "uncapped" | "capped",
  maxPurchaseQuantity: "64",
  imageUrl: "",
  inStock: true,
};

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestionsKey, setSuggestionsKey] = useState(0);

  const [currency, setCurrency] = useState("emeralds");

  useEffect(() => {
    void fetch("/api/shop/config")
      .then((r) => r.json())
      .then((data: { currency: string }) => setCurrency(data.currency));
  }, []);

  useEffect(() => {
    void fetch("/api/listings")
      .then((r) => r.json())
      .then((data: Listing[]) => setListings(data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      priceUnit: form.priceUnit,
      pricePerCount: Number(form.pricePerCount),
      maxPurchaseQuantity:
        form.purchaseLimitMode === "capped"
          ? Number(form.maxPurchaseQuantity)
          : null,
      imageUrl: form.imageUrl,
      inStock: form.inStock,
    };

    const res = await fetch(
      editingId ? `/api/listings/${editingId}` : "/api/listings",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      setError("Save failed");
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setSuggestionsKey((key) => key + 1);
    void fetch("/api/listings")
      .then((r) => r.json())
      .then((data: Listing[]) => setListings(data));
  }

  function startEdit(listing: Listing) {
    setEditingId(listing.id);
    setForm({
      name: listing.name,
      description: listing.description,
      price: String(listing.price),
      priceUnit: listing.priceUnit,
      pricePerCount: String(listing.pricePerCount),
      purchaseLimitMode:
        listing.maxPurchaseQuantity === null ? "uncapped" : "capped",
      maxPurchaseQuantity: String(listing.maxPurchaseQuantity ?? 64),
      imageUrl: listing.imageUrl,
      inStock: listing.inStock,
    });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this listing?")) return;
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    setSuggestionsKey((key) => key + 1);
    void fetch("/api/listings")
      .then((r) => r.json())
      .then((data: Listing[]) => setListings(data));
  }

  function applySuggestion(next: CraftingSuggestionFormState) {
    setEditingId(null);
    setForm(next);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <h2 style={{ color: "#ff00ff" }}>:: LISTINGS ::</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <fieldset style={{ border: "2px ridge #f0f", padding: 8 }}>
          <legend>{editingId ? "Edit listing" : "New listing"}</legend>
          <p>
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ ...retroInputStyle, width: "100%" }}
              required
            />
          </p>
          <p>
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              style={{ ...retroInputStyle, width: "100%", minHeight: 60 }}
            />
          </p>
          <p>
            <input
              type="number"
              min={0}
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              style={retroInputStyle}
              required
            />{" "}
            {currency} per{" "}
            <input
              type="number"
              min={1}
              value={form.pricePerCount}
              onChange={(e) =>
                setForm({ ...form, pricePerCount: e.target.value })
              }
              style={{ ...retroInputStyle, width: 64 }}
              required
            />{" "}
            <select
              value={form.priceUnit}
              onChange={(e) =>
                setForm({ ...form, priceUnit: e.target.value as PriceUnit })
              }
              style={retroSelectStyle}
            >
              {PRICE_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                  {Number(form.pricePerCount) === 1 ? "" : "s"}
                </option>
              ))}
            </select>{" "}
            <input
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              style={{ ...retroInputStyle, width: 240 }}
            />{" "}
            <label>
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) =>
                  setForm({ ...form, inStock: e.target.checked })
                }
              />{" "}
              In stock
            </label>
          </p>
          <p>
            Purchase limit:{" "}
            <select
              value={form.purchaseLimitMode}
              onChange={(e) =>
                setForm({
                  ...form,
                  purchaseLimitMode: e.target.value as "uncapped" | "capped",
                })
              }
              style={retroSelectStyle}
            >
              <option value="uncapped">Uncapped</option>
              <option value="capped">Capped</option>
            </select>
            {form.purchaseLimitMode === "capped" ? (
              <>
                {" "}
                max{" "}
                <input
                  type="number"
                  min={1}
                  value={form.maxPurchaseQuantity}
                  onChange={(e) =>
                    setForm({ ...form, maxPurchaseQuantity: e.target.value })
                  }
                  style={{ ...retroInputStyle, width: 96 }}
                  required
                />{" "}
                items per order
              </>
            ) : null}
          </p>
          {error ? <p style={{ color: "#f00" }}>{error}</p> : null}
          <button type="submit" style={retroBtnStyle}>
            {editingId ? "[ UPDATE ]" : "[ CREATE ]"}
          </button>{" "}
          {editingId ? (
            <button
              type="button"
              style={retroBtnStyle}
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              [ CANCEL ]
            </button>
          ) : null}
        </fieldset>
      </form>

      <CraftingSuggestionsPanel
        key={suggestionsKey}
        currency={currency}
        listingCount={listings.length}
        onApply={applySuggestion}
      />

      <table width="100%" cellPadding={6} style={retroTableBorder}>
        <tbody>
          {listings.map((listing) => (
            <tr key={listing.id}>
              <td style={{ backgroundColor: "#0a0a44" }}>
                <b>{listing.name}</b> —{" "}
                {formatListingPrice(listingPrice(listing), currency)}
                <br />
                {formatPurchaseLimit(listing) ? (
                  <span style={{ fontSize: 12 }}>{formatPurchaseLimit(listing)}</span>
                ) : (
                  <span style={{ fontSize: 12, color: "#888" }}>Uncapped per order</span>
                )}
                <br />
                {listing.inStock ? (
                  <span style={{ color: "#0f0" }}>IN STOCK</span>
                ) : (
                  <span style={{ color: "#f00" }}>OUT OF STOCK</span>
                )}
                <p style={{ fontSize: 12 }}>{listing.description}</p>
              </td>
              <td valign="top">
                <button
                  type="button"
                  style={retroBtnStyle}
                  onClick={() => startEdit(listing)}
                >
                  [ EDIT ]
                </button>{" "}
                <button
                  type="button"
                  style={retroBtnStyle}
                  onClick={() => handleDelete(listing.id)}
                >
                  [ DEL ]
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
