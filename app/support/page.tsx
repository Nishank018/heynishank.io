import type { Metadata } from "next";
import { Coffee, HeartHandshake, QrCode } from "lucide-react";
import { InnerPage } from "@/components/sections/inner-page";

export const metadata: Metadata = {
  title: "Support — Nishank Gupta",
  description: "Support Nishank's independent work.",
};
export default function SupportPage() {
  return (
    <InnerPage
      route="support"
      title="Support my work"
      subtitle="Thanks for being here. Support links will appear when configured."
    >
      <div className="support-options">
        <div>
          <Coffee />
          <b>Buy Me a Coffee</b>
          <span>Link not configured</span>
        </div>
        <div>
          <HeartHandshake />
          <b>GitHub Sponsors</b>
          <span>Link not configured</span>
        </div>
        <div>
          <QrCode />
          <b>UPI</b>
          <span>Payment details not configured</span>
        </div>
      </div>
      <p className="quiet-note">No payment or wallet details have been published.</p>
    </InnerPage>
  );
}
