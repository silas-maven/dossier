"use client";

import { useEffect } from "react";

const VISITOR_ID_KEY = "dossier:visitor_id:v1";
const SESSION_SENT_KEY = "dossier:visitor_sent:v1";

const isValidVisitorId = (value: string) => /^[A-Za-z0-9._:-]{12,128}$/.test(value);

const createVisitorId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

export default function VisitorTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let visitorId = (localStorage.getItem(VISITOR_ID_KEY) ?? "").trim();
    if (!isValidVisitorId(visitorId)) {
      visitorId = createVisitorId();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }

    if (sessionStorage.getItem(SESSION_SENT_KEY) === visitorId) return;
    sessionStorage.setItem(SESSION_SENT_KEY, visitorId);

    const payload = JSON.stringify({
      visitorId,
      path: window.location.pathname
    });

    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/metrics/visit", blob);
      return;
    }

    void fetch("/api/metrics/visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
      cache: "no-store"
    });
  }, []);

  return null;
}
