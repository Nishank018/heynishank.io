import type { Metadata } from "next";
import { InnerPage } from "@/components/sections/inner-page";

export const metadata: Metadata = {
  title: "Analytics — Nishank Gupta",
  description: "Portfolio traffic analytics.",
};
export default function AnalyticsPage() {
  return (
    <InnerPage
      route="analytics"
      title="Analytics"
      subtitle="A small window into how this portfolio is used."
    >
      <div className="analytics-grid">
        <div>
          <span>VISITORS</span>
          <b>—</b>
          <small>No analytics source connected</small>
        </div>
        <div>
          <span>PAGE VIEWS</span>
          <b>—</b>
          <small>No analytics source connected</small>
        </div>
      </div>
      <div className="analytics-chart">
        <div className="chart-heading">
          <b>Traffic over time</b>
          <div className="filter-tabs">
            <button className="is-selected">24H</button>
            <button>7D</button>
            <button>30D</button>
          </div>
        </div>
        <div className="chart-empty">Connect an analytics provider to display traffic data.</div>
      </div>
    </InnerPage>
  );
}
