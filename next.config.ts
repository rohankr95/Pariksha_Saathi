import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone build (only the traced
  // production node_modules subset + a minimal server), keeping the
  // Docker image small — see Dockerfile. Vercel does its own function
  // bundling and this setting breaks its build (ENOENT on
  // next-server.js.nft.json), so skip it there — Vercel sets VERCEL=1
  // on every build automatically.
  output: process.env.VERCEL ? undefined : "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default nextConfig;
