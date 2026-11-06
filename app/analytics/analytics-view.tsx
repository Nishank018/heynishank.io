"use client";

import { useState } from "react";

export function AnalyticsView({ totalViews }: { totalViews: number | null }) {
  const [range, setRange] = useState<"24H" | "7D" | "30D">("24H");

  return (
    <>
      <div className="analytics-grid">
        <div>
          <span>VISITORS</span>
          <b>{totalViews !== null ? "—" : "—"}</b>
          <small>Unique visitor tracking requires an analytics provider</small>
        </div>
        <div>
          <span>PAGE VIEWS</span>
          <b>{totalViews !== null ? totalViews.toLocaleString("en-IN") : "—"}</b>
          <small>
            {totalViews !== null
              ? "Recorded via portfolio view counter"
              : "No Redis analytics source connected"}
          </small>
        </div>
      </div>
      <div className="analytics-chart">
        <div className="chart-heading">
          <b>Traffic over time ({range})</b>
          <div className="filter-tabs" role="tablist">
            {(["24H", "7D", "30D"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={range === tab ? "is-selected" : ""}
                onClick={() => setRange(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="chart-empty">
          Time-series chart for {range} requires an analytics provider (e.g. Vercel Analytics, Umami, or PostHog).
        </div>
      </div>
    </>
  );
}
