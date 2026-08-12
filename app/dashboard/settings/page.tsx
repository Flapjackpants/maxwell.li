"use client";

import { motion } from "framer-motion";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type {
  ModuleMeta,
  ModulesSettingsMap,
} from "@/lib/dashboard/types";
import { PROVIDER_LABELS } from "@/lib/dashboard/types";

type ProviderStatus = Record<
  string,
  { connected: boolean; needsConnect: boolean }
>;

function SettingsInner() {
  const searchParams = useSearchParams();
  const [modules, setModules] = useState<ModuleMeta[]>([]);
  const [settings, setSettings] = useState<ModulesSettingsMap>({});
  const [providers, setProviders] = useState<ProviderStatus>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canvasUrl, setCanvasUrl] = useState("");
  const [canvasToken, setCanvasToken] = useState("");
  const [showCanvasManual, setShowCanvasManual] = useState(false);
  const [loadNonce, setLoadNonce] = useState(0);

  const paramMessage =
    searchParams.get("connected") === "1" ? "Connections updated." : null;
  const paramError = searchParams.get("error")?.replace(/_/g, " ") ?? null;
  const showCanvas =
    showCanvasManual || searchParams.get("connect") === "canvas";
  const bannerMessage = message ?? paramMessage;
  const bannerError = error ?? paramError;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/settings", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        const json = (await res.json()) as {
          modules: ModuleMeta[];
          settings: ModulesSettingsMap;
          providers: ProviderStatus;
        };
        if (cancelled) return;
        setModules(json.modules);
        setSettings(json.settings);
        setProviders(json.providers);
        const base = json.settings.canvas?.config?.baseUrl ?? "";
        if (base) setCanvasUrl(base);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loadNonce]);

  const load = () => setLoadNonce((n) => n + 1);

  const updateEnabled = (id: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [id]: {
        enabled,
        config: prev[id]?.config ?? {},
      },
    }));
  };

  const updateConfig = (id: string, key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [id]: {
        enabled: prev[id]?.enabled ?? false,
        config: { ...(prev[id]?.config ?? {}), [key]: value },
      },
    }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules: settings }),
      });
      if (!res.ok) throw new Error("Save failed");
      const json = (await res.json()) as { settings: ModulesSettingsMap };
      setSettings(json.settings);
      setMessage("Settings saved.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const startOAuth = async (
    mode: "all" | "provider",
    provider?: "google" | "slack" | "discord" | "canvas",
  ) => {
    setError(null);
    if (provider === "canvas") {
      setShowCanvasManual(true);
      return;
    }
    if (provider === "discord") {
      setMessage(
        providers.discord?.connected
          ? "Discord bot token is configured via DISCORD_BOT_TOKEN."
          : "Set DISCORD_BOT_TOKEN in the server environment, then add channel IDs below.",
      );
      return;
    }

    const res = await fetch("/api/dashboard/oauth/start", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        provider,
        returnTo: "/dashboard/settings",
      }),
    });
    const json = (await res.json()) as {
      redirectUrl?: string;
      nothingToConnect?: boolean;
      error?: string;
    };
    if (!res.ok) {
      setError(json.error ?? "OAuth start failed");
      return;
    }
    if (json.nothingToConnect) {
      setMessage("All enabled providers are already connected.");
      return;
    }
    if (json.redirectUrl?.includes("connect=canvas")) {
      setShowCanvasManual(true);
      return;
    }
    if (json.redirectUrl) {
      window.location.href = json.redirectUrl;
    }
  };

  const disconnect = async (provider: "google" | "slack" | "canvas") => {
    const res = await fetch("/api/dashboard/oauth/start", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    if (!res.ok) {
      setError("Disconnect failed");
      return;
    }
    setMessage(`${provider} disconnected.`);
    await load();
  };

  const saveCanvas = async () => {
    setSaving(true);
    setError(null);
    try {
      const advanceQueue = searchParams.get("queue") === "1";
      const res = await fetch("/api/dashboard/oauth/canvas", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: canvasUrl,
          accessToken: canvasToken,
          advanceQueue,
        }),
      });
      const json = (await res.json()) as {
        redirectUrl?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Canvas save failed");
      setCanvasToken("");
      setShowCanvasManual(false);
      if (json.redirectUrl && !json.redirectUrl.includes("/dashboard/settings?connected")) {
        window.location.href = json.redirectUrl;
        return;
      }
      setMessage("Canvas connected.");
      await load();
      if (json.redirectUrl?.includes("connected=1")) {
        window.history.replaceState(null, "", "/dashboard/settings?connected=1");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Canvas save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="dash-main">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="dash-hero"
      >
        <p className="mono-data home-hero-eyebrow">Personal ops</p>
        <h1 className="dash-title">Settings</h1>
        <p className="dash-lede">
          Enable modules and connect providers. Use Connect all to walk through
          every OAuth flow for enabled modules.
        </p>
      </motion.div>

      {bannerMessage ? (
        <p className="dash-banner dash-banner--ok">{bannerMessage}</p>
      ) : null}
      {bannerError ? (
        <p className="dash-banner dash-banner--err">{bannerError}</p>
      ) : null}

      <section className="dash-panel dash-panel--settings">
        <header className="dash-panel-header">
          <h2 className="dash-panel-title">Connections</h2>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => startOAuth("all")}
          >
            Connect all
          </button>
        </header>
        <ul className="dash-provider-list">
          {(
            ["google", "slack", "discord", "canvas"] as const
          ).map((p) => (
            <li key={p} className="dash-provider-row">
              <div>
                <p className="dash-list-primary">{PROVIDER_LABELS[p]}</p>
                <p className="dash-list-meta">
                  {providers[p]?.connected ? "Connected" : "Not connected"}
                </p>
              </div>
              <div className="dash-provider-actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => startOAuth("provider", p)}
                >
                  Connect
                </button>
                {p !== "discord" && providers[p]?.connected ? (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => disconnect(p)}
                  >
                    Disconnect
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        {showCanvas ? (
          <div className="dash-canvas-form">
            <h3 className="dash-panel-title">Canvas credentials</h3>
            <label className="dash-field">
              <span>Base URL</span>
              <input
                type="url"
                value={canvasUrl}
                onChange={(e) => setCanvasUrl(e.target.value)}
                placeholder="https://canvas.university.edu"
              />
            </label>
            <label className="dash-field">
              <span>API token</span>
              <input
                type="password"
                value={canvasToken}
                onChange={(e) => setCanvasToken(e.target.value)}
                placeholder="Canvas access token"
              />
            </label>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => void saveCanvas()}
              disabled={saving || !canvasUrl || !canvasToken}
            >
              Save Canvas
            </button>
          </div>
        ) : null}
      </section>

      <section className="dash-panel dash-panel--settings">
        <header className="dash-panel-header">
          <h2 className="dash-panel-title">Modules</h2>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void save()}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </header>

        <ul className="dash-module-settings">
          {modules.map((m) => {
            const entry = settings[m.id] ?? {
              enabled: m.defaultEnabled,
              config: {},
            };
            return (
              <li key={m.id} className="dash-module-settings-item">
                <label className="dash-toggle-row">
                  <input
                    type="checkbox"
                    checked={entry.enabled}
                    onChange={(e) => updateEnabled(m.id, e.target.checked)}
                  />
                  <span>
                    <span className="dash-list-primary">{m.title}</span>
                    <span className="dash-list-meta">{m.description}</span>
                  </span>
                </label>
                {entry.enabled && m.configFields?.length ? (
                  <div className="dash-module-config">
                    {m.configFields.map((field) => (
                      <label key={field.key} className="dash-field">
                        <span>{field.label}</span>
                        {field.type === "textarea" ? (
                          <textarea
                            value={entry.config[field.key] ?? ""}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                              updateConfig(m.id, field.key, e.target.value)
                            }
                            rows={2}
                          />
                        ) : (
                          <input
                            type={field.type === "password" ? "password" : "text"}
                            value={entry.config[field.key] ?? ""}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                              updateConfig(m.id, field.key, e.target.value)
                            }
                          />
                        )}
                        {field.help ? (
                          <span className="dash-field-help">{field.help}</span>
                        ) : null}
                      </label>
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

export default function DashboardSettingsPage() {
  return (
    <Suspense fallback={<main className="dash-main"><p className="dash-panel-muted">Loading…</p></main>}>
      <SettingsInner />
    </Suspense>
  );
}
