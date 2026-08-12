"use client";

import Link from "next/link";
import { ModulePanelShell } from "../ModulePanelShell";
import type { UmazingOrdersPayload } from "@/lib/dashboard/modules/umazing/fetch";

export function UmazingPanel() {
  return (
    <ModulePanelShell moduleId="umazing" title="Umazing orders">
      {(raw) => {
        const data = raw as UmazingOrdersPayload;
        return (
          <div>
            <p className="dash-list-meta" style={{ marginBottom: "0.75rem" }}>
              {data.openCount} open ·{" "}
              <Link href="/admin/orders" className="dash-list-link">
                Manage
              </Link>
            </p>
            {data.orders.length === 0 ? (
              <p className="dash-panel-muted">No orders yet.</p>
            ) : (
              <ul className="dash-list">
                {data.orders.map((o) => (
                  <li key={o.id} className="dash-list-row">
                    <span className="dash-list-primary">{o.buyerUsername}</span>
                    <span className="dash-list-meta">{o.status}</span>
                    <span className="mono-data">{o.total}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }}
    </ModulePanelShell>
  );
}
