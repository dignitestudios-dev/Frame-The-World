import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "frame-the-world-bucket.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "t4.ftcdn.net",
      },
    ],
  },
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
