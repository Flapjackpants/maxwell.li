"use client";

import { useEffect, useState } from "react";
import {
  retroBtnStyle,
  retroInputStyle,
  retroTableBorder,
} from "@/lib/retro-theme";
import type { Listing } from "@/lib/shop/types";

const emptyForm = {
  name: "",
  description: "",
  price: "0",
  imageUrl: "",
  inStock: true,
};

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      imageUrl: listing.imageUrl,
      inStock: listing.inStock,
    });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this listing?")) return;
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    void fetch("/api/listings")
      .then((r) => r.json())
      .then((data: Listing[]) => setListings(data));
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
              placeholder="Price per stack (64 items)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              style={retroInputStyle}
              required
            />{" "}
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

      <table width="100%" cellPadding={6} style={retroTableBorder}>
        <tbody>
          {listings.map((listing) => (
            <tr key={listing.id}>
              <td style={{ backgroundColor: "#0a0a44" }}>
                <b>{listing.name}</b> — {listing.price} {currency} / stack
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
