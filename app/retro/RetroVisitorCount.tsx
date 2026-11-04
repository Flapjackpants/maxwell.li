"use client";

import { useEffect, useRef, useState } from "react";

export function RetroVisitorCount() {
  const [displayText, setDisplayText] = useState("???????");
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    void fetch("/api/retro/visitors", { method: "POST" })
      .then(async (response) => {
        if (!response.ok) return;
        const { count }: { count: number } = await response.json();
        setDisplayText(String(count).padStart(7, "0"));
      })
      .catch(() => {
        // Keep the placeholder if the count is unavailable.
      });
  }, []);

  return displayText;
}
