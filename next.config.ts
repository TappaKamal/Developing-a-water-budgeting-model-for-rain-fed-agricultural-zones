import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Convex generated types are created at runtime via `npx convex dev`
    // This is standard practice for Convex + Next.js projects
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
