"use client";

import { useEffect, useState } from "react";
import { retroBtnStyle } from "@/lib/retro-theme";

export function AdminStoreToggle() {
  const [storeOpen, setStoreOpen] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/shop/config", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { storeOpen?: boolean }) => {
        setStoreOpen(data.storeOpen ?? true);
      })
      .catch(() => setStoreOpen(true));
  }, []);

  async function toggle() {
    if (storeOpen === null || busy) return;
    const nextState = !storeOpen;
    setBusy(true);
    try {
      const res = await fetch("/api/shop/config", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeOpen: nextState }),
      });
      if (res.ok) {
        const data = (await res.json()) as { storeOpen: boolean };
        setStoreOpen(data.storeOpen);
      }
    } finally {
      setBusy(false);
    }
  }

  if (storeOpen === null) {
    return null;
  }

  const isOpen = storeOpen;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={
        isOpen
          ? "Store is currently open. Click to close store."
          : "Store is currently closed. Click to open store."
      }
      style={{
        ...retroBtnStyle,
        background: isOpen ? "#00aa00" : "#cc0000",
        color: "#ffffff",
        borderColor: isOpen ? "#55ff55" : "#ff6666",
        cursor: busy ? "wait" : "pointer",
        opacity: busy ? 0.7 : 1,
      }}
    >
      {busy
        ? "[ UPDATING... ]"
        : isOpen
          ? "[ STORE: OPEN ]"
          : "[ STORE: CLOSED ]"}
    </button>
  );
}
