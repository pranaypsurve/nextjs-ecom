import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-678a28646eb147b2bea0fc8c1ed91983.r2.dev",
      },
      {
        protocol: "https",
        hostname: "ecom-images.d677623bef03add6a9879384c97d24b0.r2.cloudflarestorage.com",
      },
    ],
  },
  
  // Cache configuration
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 30, // Minimum allowed value is 30
    },
  },
};

export default nextConfig;
