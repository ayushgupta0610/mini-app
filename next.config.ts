import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  },
  images: {
    domains: [`${process.env.NEXT_PUBLIC_BASE_URL}`, "localhost"],
    formats: ["image/webp"],
  },
  async headers() {
    return [
      {
        source: "/.well-known/farcaster.json",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=86400", // Cache for 24 hours
          },
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
