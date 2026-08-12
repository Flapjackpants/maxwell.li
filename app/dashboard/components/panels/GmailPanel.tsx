"use client";

import { ModulePanelShell } from "../ModulePanelShell";
import type { GmailPayload } from "@/lib/dashboard/modules/gmail/fetch";

export function GmailPanel() {
  return (
    <ModulePanelShell moduleId="gmail" title="Gmail">
      {(raw) => {
        const data = raw as GmailPayload;
        if (data.error) return <p className="dash-panel-error">{data.error}</p>;
        if (!data.messages.length) {
          return <p className="dash-panel-muted">Inbox empty.</p>;
        }
        return (
          <ul className="dash-list">
            {data.messages.map((m) => (
              <li key={m.id} className="dash-list-block">
                <a
                  href={`https://mail.google.com/mail/u/0/#inbox/${m.threadId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dash-list-link"
                >
                  {m.subject}
                </a>
                <p className="dash-list-meta">{m.from}</p>
                <p className="dash-panel-muted">{m.snippet}</p>
              </li>
            ))}
          </ul>
        );
      }}
    </ModulePanelShell>
  );
}
