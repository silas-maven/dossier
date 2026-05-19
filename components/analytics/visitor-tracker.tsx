"use client";

import { useEffect } from "react";

const STORAGE_KEY = "dossier:last-visit-track";
const TRACK_INTERVAL_MS = 1000 * 60 * 30;

export default function VisitorTracker() {
  useEffect(() => {
    const now = Date.now();
    const lastTracked = Number.parseInt(sessionStorage.getItem(STORAGE_KEY) ?? "0", 10) || 0;
    if (now - lastTracked < TRACK_INTERVAL_MS) return;

    sessionStorage.setItem(STORAGE_KEY, String(now));
    void fetch("/api/metrics/visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname, referrer: document.referrer }),
      keepalive: true,
    }).catch(() => {
      sessionStorage.removeItem(STORAGE_KEY);
    });
  }, []);

  return null;
}
