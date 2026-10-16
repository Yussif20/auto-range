import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Photos uploaded from the admin live in Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  // Admin photo uploads; the browser shrinks them well below this first.
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  // Browsers still ask for /favicon.ico; serve the SVG icon instead of hitting [locale].
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon.svg" }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
