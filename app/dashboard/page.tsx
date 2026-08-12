"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { renderModulePanel } from "./components/panel-map";
import type { ModuleMeta, ModulesSettingsMap } from "@/lib/dashboard/types";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export default function DashboardPage() {
  const [enabledIds, setEnabledIds] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/settings", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        const json = (await res.json()) as {
          modules: ModuleMeta[];
          settings: ModulesSettingsMap;
        };
        if (cancelled) return;
        const ids = json.modules
          .filter((m) => json.settings[m.id]?.enabled)
          .map((m) => m.id);
        setEnabledIds(ids);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Error");
        setEnabledIds([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="dash-main">
      <motion.div {...fadeUp} className="dash-hero">
        <p className="mono-data home-hero-eyebrow">Personal ops</p>
        <h1 className="dash-title">Dashboard</h1>
        <p className="dash-lede">
          Modules you enable in{" "}
          <Link href="/dashboard/settings" className="dash-list-link">
            settings
          </Link>
          .
        </p>
      </motion.div>

      {error ? <p className="dash-panel-error">{error}</p> : null}

      {enabledIds === null ? (
        <p className="dash-panel-muted">Loading modules…</p>
      ) : enabledIds.length === 0 ? (
        <p className="dash-panel-muted">
          No modules enabled.{" "}
          <Link href="/dashboard/settings" className="dash-list-link">
            Open settings
          </Link>
          .
        </p>
      ) : (
        <div className="dash-grid">
          {enabledIds.map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
            >
              {renderModulePanel(id)}
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
