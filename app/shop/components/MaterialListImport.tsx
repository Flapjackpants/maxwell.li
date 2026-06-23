"use client";

import { useRef, useState } from "react";
import { retroBtnStyle, retroInputStyle } from "@/lib/retro-theme";
import {
  parseLitematicaMaterialList,
  resolveMaterialListImport,
  type MaterialListSkipped,
} from "@/lib/shop/litematica-material-list";
import type { Listing } from "@/lib/shop/types";
import { useCart } from "./CartProvider";
import { MaterialListSkippedModal } from "./MaterialListSkippedModal";

type Props = {
  listings: Listing[];
};

export function MaterialListImport({ listings }: Props) {
  const { items, mergeCartQuantities } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [skippedModal, setSkippedModal] = useState<{
    skipped: MaterialListSkipped[];
    addedCount: number;
  } | null>(null);

  function processText(text: string) {
    setError(null);
    setSuccess(null);
    const entries = parseLitematicaMaterialList(text);
    if (entries.length === 0) {
      setError("No materials with missing items found in that list.");
      return;
    }

    const { updates, skipped } = resolveMaterialListImport(
      entries,
      listings,
      items,
    );

    if (updates.length === 0 && skipped.length === 0) {
      setError("Nothing to add from that material list.");
      return;
    }

    if (updates.length > 0) {
      mergeCartQuantities(updates);
    }

    if (skipped.length > 0) {
      setSkippedModal({ skipped, addedCount: updates.length });
    } else if (updates.length > 0) {
      setSuccess(`Added ${updates.length} listing(s) to your cart.`);
    }

    setPasteOpen(false);
    setPasteText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFile(file: File) {
    try {
      const text = await file.text();
      processText(text);
    } catch {
      setError("Could not read that file.");
    }
  }

  return (
    <>
      <fieldset
        style={{
          border: "2px ridge #0ff",
          padding: 12,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        <legend style={{ color: "#0ff", fontWeight: "bold" }}>
          Import Litematica material list
        </legend>
        <p style={{ fontSize: 13, margin: "0 0 10px" }}>
          Upload a <code>.txt</code> export from Litematica to add shop listings
          to your cart. Items not sold here or over the purchase limit are
          skipped.
        </p>
        <p style={{ margin: "0 0 10px" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <button
            type="button"
            style={retroBtnStyle}
            onClick={() => fileInputRef.current?.click()}
          >
            [ UPLOAD .TXT ]
          </button>{" "}
          <button
            type="button"
            style={retroBtnStyle}
            onClick={() => {
              setPasteOpen((open) => !open);
              setError(null);
            }}
          >
            [ PASTE LIST ]
          </button>
        </p>
        {pasteOpen ? (
          <div style={{ marginTop: 8 }}>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste Litematica material list here..."
              style={{
                ...retroInputStyle,
                width: "100%",
                minHeight: 120,
                fontFamily: "monospace",
                fontSize: 11,
              }}
            />
            <p style={{ margin: "8px 0 0" }}>
              <button
                type="button"
                style={retroBtnStyle}
                onClick={() => processText(pasteText)}
              >
                [ IMPORT ]
              </button>
            </p>
          </div>
        ) : null}
        {error ? (
          <p style={{ color: "#f00", margin: "10px 0 0", fontSize: 13 }}>
            {error}
          </p>
        ) : null}
        {success ? (
          <p style={{ color: "#0f0", margin: "10px 0 0", fontSize: 13 }}>
            {success}
          </p>
        ) : null}
      </fieldset>

      {skippedModal ? (
        <MaterialListSkippedModal
          skipped={skippedModal.skipped}
          addedCount={skippedModal.addedCount}
          onDismiss={() => setSkippedModal(null)}
        />
      ) : null}
    </>
  );
}
