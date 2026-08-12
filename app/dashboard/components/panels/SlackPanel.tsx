"use client";

import { ModulePanelShell } from "../ModulePanelShell";
import type { SlackPayload } from "@/lib/dashboard/modules/slack/fetch";

export function SlackPanel() {
  return (
    <ModulePanelShell moduleId="slack" title="Slack">
      {(raw) => {
        const data = raw as SlackPayload;
        if (data.error) return <p className="dash-panel-error">{data.error}</p>;
        if (!data.messages.length) {
          return <p className="dash-panel-muted">No messages.</p>;
        }
        return (
          <ul className="dash-list">
            {data.messages.map((m) => (
              <li key={`${m.channel}-${m.ts}`} className="dash-list-block">
                <p className="dash-list-primary">
                  #{m.channelName}{" "}
                  <span className="dash-list-meta">· {m.user}</span>
                </p>
                <p className="dash-panel-muted">{m.text}</p>
              </li>
            ))}
          </ul>
        );
      }}
    </ModulePanelShell>
  );
}
