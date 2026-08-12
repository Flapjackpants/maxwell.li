"use client";

import { useEffect, useState } from "react";

type Props = {
  moduleId: string;
  title: string;
  children: (data: unknown, reload: () => void) => React.ReactNode;
};

export function ModulePanelShell({ moduleId, title, children }: Props) {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/dashboard/modules/${moduleId}`, { credentials: "include" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? `HTTP ${res.status}`);
        }
        if (!cancelled) {
          setData(json);
          setError(null);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setData(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [moduleId, nonce]);

  const reload = () => {
    setLoading(true);
    setNonce((n) => n + 1);
  };

  return (
    <section className="dash-panel">
      <header className="dash-panel-header">
        <h2 className="dash-panel-title">{title}</h2>
        <button
          type="button"
          className="dash-panel-refresh"
          onClick={reload}
          disabled={loading}
        >
          Refresh
        </button>
      </header>
      {loading && !data ? (
        <p className="dash-panel-muted">Loading…</p>
      ) : error ? (
        <p className="dash-panel-error">{error}</p>
      ) : (
        children(data, reload)
      )}
    </section>
  );
}
