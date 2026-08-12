"use client";

import { ModulePanelShell } from "../ModulePanelShell";
import type { YoutubeStatsPayload } from "@/lib/dashboard/modules/youtube/fetch";

export function YoutubePanel() {
  return (
    <ModulePanelShell moduleId="youtube" title="YouTube">
      {(raw) => {
        const data = raw as YoutubeStatsPayload;
        if (data.error) return <p className="dash-panel-error">{data.error}</p>;
        return (
          <div>
            {data.channelTitle ? (
              <p className="dash-list-primary">{data.channelTitle}</p>
            ) : null}
            <dl className="dash-stat-grid">
              <div>
                <dt>Subscribers</dt>
                <dd className="mono-data">{data.subscriberCount ?? "—"}</dd>
              </div>
              <div>
                <dt>Views</dt>
                <dd className="mono-data">{data.viewCount ?? "—"}</dd>
              </div>
              <div>
                <dt>Videos</dt>
                <dd className="mono-data">{data.videoCount ?? "—"}</dd>
              </div>
            </dl>
          </div>
        );
      }}
    </ModulePanelShell>
  );
}
