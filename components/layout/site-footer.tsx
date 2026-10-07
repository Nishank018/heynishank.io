"use client";

import { useEffect, useState } from "react";

function getIndiaTime() {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function SiteFooter() {
  const [time, setTime] = useState("--:--:--");
  const year = new Date().getFullYear();

  useEffect(() => {
    setTime(getIndiaTime());
    const interval = window.setInterval(() => setTime(getIndiaTime()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <footer className="site-footer">
      <p className="site-footer__made">Designed &amp; Made by Nishank Gupta</p>
      <div className="site-footer__bottom">
        <span>Nishank Gupta · © {year}</span>
        <span aria-label={`Live time in India: ${time}`} className="live-clock">
          <span className="live-clock__dot" /> LIVE · IST {time}
        </span>
      </div>
    </footer>
  );
}
