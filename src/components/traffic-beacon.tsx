"use client";

import { useEffect } from "react";

// Fires once per browser tab-session to record a "site open". For anonymous
// visitors it sends a random, non-identifying id (kept in localStorage) so the
// report can count unique guests without any login or personal data.
export function TrafficBeacon() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("ps_v")) return;
      sessionStorage.setItem("ps_v", "1");
    } catch {
      // private mode etc. — still send once per mount
    }

    let vid = "";
    try {
      vid = localStorage.getItem("ps_vid") ?? "";
      if (!vid) {
        vid =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID().replace(/-/g, "")
            : Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("ps_vid", vid);
      }
    } catch {
      /* ignore */
    }

    const payload = JSON.stringify({ vid });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/traffic", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/traffic", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true });
      }
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
