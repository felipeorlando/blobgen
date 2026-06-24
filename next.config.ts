import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep server-only native/IO packages out of the bundle.
  serverExternalPackages: ["pg", "bullmq", "ioredis", "ffmpeg-static"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" }, // YouTube thumbnails
      { protocol: "https", hostname: "yt3.ggpht.com" }, // YouTube avatars
      { protocol: "https", hostname: "images.pexels.com" }, // Pexels stock
      { protocol: "https", hostname: "replicate.delivery" }, // Replicate outputs
    ],
  },
};

export default nextConfig;
