"use client";

import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

export function ProfileViews() {
  const [views, setViews] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/views", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const payload: unknown = await response.json();
        if (
          active &&
          typeof payload === "object" &&
          payload !== null &&
          "views" in payload &&
          typeof payload.views === "number"
        )
          setViews(payload.views);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  if (views === null) return null;
  return (
    <span className="profile-view-count">
      <Eye size={12} /> {views.toLocaleString("en-IN")} views
    </span>
  );
}
