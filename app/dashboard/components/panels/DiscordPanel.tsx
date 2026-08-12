"use client";

import { ModulePanelShell } from "../ModulePanelShell";
import type { DiscordPayload } from "@/lib/dashboard/modules/discord/fetch";

export function DiscordPanel() {
  return (
    <ModulePanelShell moduleId="discord" title="Discord">
      {(raw) => {
        const data = raw as DiscordPayload;
        if (data.error) return <p className="dash-panel-error">{data.error}</p>;
        if (!data.messages.length) {
          return <p className="dash-panel-muted">No messages.</p>;
        }
        return (
          <ul className="dash-list">
            {data.messages.map((m) => (
              <li key={m.id} className="dash-list-block">
                <p className="dash-list-primary">
                  {m.author}{" "}
                  <span className="dash-list-meta">· {m.channelLabel}</span>
                </p>
                <p className="dash-panel-muted">{m.content}</p>
              </li>
            ))}
          </ul>
        );
      }}
    </ModulePanelShell>
  );
}
