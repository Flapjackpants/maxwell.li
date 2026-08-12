"use client";

import { ModulePanelShell } from "../ModulePanelShell";
import type { CanvasPayload } from "@/lib/dashboard/modules/canvas/fetch";

export function CanvasPanel() {
  return (
    <ModulePanelShell moduleId="canvas" title="Canvas">
      {(raw) => {
        const data = raw as CanvasPayload;
        if (data.error) return <p className="dash-panel-error">{data.error}</p>;
        if (!data.assignments.length) {
          return <p className="dash-panel-muted">No upcoming assignments.</p>;
        }
        return (
          <ul className="dash-list">
            {data.assignments.map((a) => (
              <li key={a.id} className="dash-list-block">
                <a
                  href={a.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dash-list-link"
                >
                  {a.name}
                </a>
                <p className="dash-list-meta">
                  {a.courseName}
                  {a.dueAt
                    ? ` · due ${new Date(a.dueAt).toLocaleString()}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        );
      }}
    </ModulePanelShell>
  );
}
