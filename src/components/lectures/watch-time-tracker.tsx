"use client";

import { useEffect, useRef } from "react";

// Minimal shape of the bits of the YouTube IFrame Player API this component
// actually uses — the full type-def lives in an untyped third-party package
// we don't otherwise need.
type YTPlayerState = { PLAYING: number; PAUSED: number; ENDED: number };
type YTPlayer = { destroy: () => void };
type YTPlayerEvent = { data: number };
type YTNamespace = {
  Player: new (
    el: HTMLElement | string,
    opts: {
      events: {
        onStateChange: (e: YTPlayerEvent) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: YTPlayerState;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const FLUSH_INTERVAL_SEC = 20;
let apiLoadPromise: Promise<YTNamespace> | null = null;

function loadYoutubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevReady?.();
      resolve(window.YT as YTNamespace);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return apiLoadPromise;
}

function sendPing(lectureId: string, deltaSeconds: number, useBeacon: boolean) {
  if (deltaSeconds <= 0) return;
  const url = `/api/lectures/${lectureId}/watch-ping`;
  const payload = JSON.stringify({ deltaSeconds });
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
  } else {
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(
      () => {}
    );
  }
}

/**
 * Attaches to the YouTube embed already rendered at `iframeId` and reports
 * actual accumulated playback seconds — not page-opens, not video length —
 * to /api/lectures/[id]/watch-ping every ~20s while playing, plus a final
 * flush on tab-hide/close. Renders nothing.
 */
export function WatchTimeTracker({ lectureId, iframeId }: { lectureId: string; iframeId: string }) {
  const pendingSecondsRef = useRef(0);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let player: YTPlayer | null = null;
    let tickInterval: ReturnType<typeof setInterval> | null = null;
    let flushInterval: ReturnType<typeof setInterval> | null = null;

    const flush = (useBeacon: boolean) => {
      const seconds = pendingSecondsRef.current;
      pendingSecondsRef.current = 0;
      sendPing(lectureId, seconds, useBeacon);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") flush(true);
    };
    const handlePageHide = () => flush(true);

    loadYoutubeApi().then((YT) => {
      if (cancelled) return;
      player = new YT.Player(iframeId, {
        events: {
          onStateChange: (e) => {
            isPlayingRef.current = e.data === YT.PlayerState.PLAYING;
          },
        },
      });

      tickInterval = setInterval(() => {
        if (isPlayingRef.current) pendingSecondsRef.current += 1;
      }, 1000);
      flushInterval = setInterval(() => flush(false), FLUSH_INTERVAL_SEC * 1000);

      document.addEventListener("visibilitychange", handleVisibility);
      window.addEventListener("pagehide", handlePageHide);
    });

    return () => {
      cancelled = true;
      if (tickInterval) clearInterval(tickInterval);
      if (flushInterval) clearInterval(flushInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      flush(false);
      player?.destroy();
    };
  }, [lectureId, iframeId]);

  return null;
}
