"use client";

import { ModulePanelShell } from "../ModulePanelShell";
import type { CalendarPayload } from "@/lib/dashboard/modules/calendar/fetch";

export function CalendarPanel() {
  return (
    <ModulePanelShell moduleId="calendar" title="Calendar">
      {(raw) => {
        const data = raw as CalendarPayload;
        if (data.error) return <p className="dash-panel-error">{data.error}</p>;
        if (!data.events.length) {
          return <p className="dash-panel-muted">No upcoming events.</p>;
        }
        return (
          <ul className="dash-list">
            {data.events.map((e) => (
              <li key={e.id} className="dash-list-block">
                <a
                  href={e.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dash-list-link"
                >
                  {e.summary}
                </a>
                <p className="dash-list-meta">
                  {e.start
                    ? new Date(e.start).toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "—"}
                </p>
              </li>
            ))}
          </ul>
        );
      }}
    </ModulePanelShell>
  );
}
