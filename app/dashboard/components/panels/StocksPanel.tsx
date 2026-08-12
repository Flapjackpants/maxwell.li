"use client";

import { useEffect, useState } from "react";
import type {
  StockRange,
  StocksPayload,
} from "@/lib/dashboard/modules/stocks/fetch";

const RANGES: { id: StockRange; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
  { id: "all", label: "All" },
];

export function StocksPanel() {
  const [range, setRange] = useState<StockRange>("day");
  const [data, setData] = useState<StocksPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/dashboard/modules/stocks?range=${range}`, {
      credentials: "include",
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
        if (!cancelled) {
          setData(json as StocksPayload);
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
  }, [range, nonce]);

  return (
    <section className="dash-panel">
      <header className="dash-panel-header">
        <h2 className="dash-panel-title">Stocks</h2>
        <button
          type="button"
          className="dash-panel-refresh"
          onClick={() => {
            setLoading(true);
            setNonce((n) => n + 1);
          }}
          disabled={loading}
        >
          Refresh
        </button>
      </header>
      <div className="dash-range-tabs" role="tablist" aria-label="Range">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={range === r.id}
            className={
              range === r.id
                ? "dash-range-tab dash-range-tab--active"
                : "dash-range-tab"
            }
            onClick={() => {
              if (r.id !== range) {
                setLoading(true);
                setRange(r.id);
              }
            }}
          >
            {r.label}
          </button>
        ))}
      </div>
      {loading && !data ? (
        <p className="dash-panel-muted">Loading…</p>
      ) : error ? (
        <p className="dash-panel-error">{error}</p>
      ) : data?.error ? (
        <p className="dash-panel-error">{data.error}</p>
      ) : !data?.quotes.length ? (
        <p className="dash-panel-muted">No quotes yet.</p>
      ) : (
        <ul className="dash-list">
          {data.quotes.map((q) => (
            <li key={q.symbol} className="dash-list-row">
              <span className="dash-list-primary mono-data">{q.symbol}</span>
              <span className="dash-list-secondary">${q.price.toFixed(2)}</span>
              <span
                className={
                  q.changePercent >= 0
                    ? "dash-change dash-change--up"
                    : "dash-change dash-change--down"
                }
              >
                {q.changePercent >= 0 ? "+" : ""}
                {q.changePercent.toFixed(2)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
