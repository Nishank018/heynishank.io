import type { Metadata } from "next";
import Image from "next/image";
import { Coffee, HeartHandshake, QrCode, ArrowUpRight } from "lucide-react";
import { InnerPage } from "@/components/sections/inner-page";
import { getSiteProfile } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Support — Nishank Gupta",
  description: "Support Nishank's independent work.",
};
export const revalidate = 60;

export default async function SupportPage() {
  const profile = await getSiteProfile();
  const support = profile.support || {};
  const hasAnyConfig = Boolean(
    support.coffee || support.github || support.upi || support.qr || support.note,
  );

  return (
    <InnerPage
      route="support"
      title="Support my work"
      subtitle="Thanks for being here. Every contribution fuels independent development and learning."
    >
      <div className="support-options">
        {support.coffee ? (
          <a
            href={support.coffee}
            target="_blank"
            rel="noopener noreferrer"
            className="support-card support-card--active"
          >
            <Coffee />
            <b>Buy Me a Coffee</b>
            <span>
              Support with a coffee <ArrowUpRight size={12} />
            </span>
          </a>
        ) : (
          <div>
            <Coffee />
            <b>Buy Me a Coffee</b>
            <span>Link not configured</span>
          </div>
        )}

        {support.github ? (
          <a
            href={support.github}
            target="_blank"
            rel="noopener noreferrer"
            className="support-card support-card--active"
          >
            <HeartHandshake />
            <b>GitHub Sponsors</b>
            <span>
              Sponsor on GitHub <ArrowUpRight size={12} />
            </span>
          </a>
        ) : (
          <div>
            <HeartHandshake />
            <b>GitHub Sponsors</b>
            <span>Link not configured</span>
          </div>
        )}

        <div>
          <QrCode />
          <b>UPI Direct</b>
          <span>{support.upi ? support.upi : "Payment details not configured"}</span>
        </div>
      </div>

      {support.qr && (
        <div style={{ marginTop: 28, padding: 20, border: "1px dashed hsl(var(--border))", borderRadius: 8, background: "hsl(var(--card))", maxWidth: 320 }}>
          <b style={{ display: "block", marginBottom: 8, fontSize: 12, fontFamily: "var(--font-geist-mono)" }}>
            SCAN UPI QR CODE:
          </b>
          <div style={{ position: "relative", width: "100%", height: 260, borderRadius: 6, overflow: "hidden", background: "#fff" }}>
            <Image
              src={support.qr}
              alt="UPI Payment QR Code"
              fill
              unoptimized
              sizes="320px"
              style={{ objectFit: "contain", padding: 8 }}
            />
          </div>
          {support.upi && (
            <p style={{ marginTop: 8, fontSize: 11, fontFamily: "var(--font-geist-mono)", color: "hsl(var(--muted-foreground))", textAlign: "center" }}>
              UPI ID: {support.upi}
            </p>
          )}
        </div>
      )}

      {support.note ? (
        <p className="quiet-note" style={{ marginTop: 20 }}>{support.note}</p>
      ) : !hasAnyConfig ? (
        <p className="quiet-note" style={{ marginTop: 20 }}>No payment or wallet details have been published.</p>
      ) : null}
    </InnerPage>
  );
}
