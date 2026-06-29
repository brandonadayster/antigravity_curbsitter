import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:4040',
    '192.168.99.105',
    '192.168.99.105:3000',
    '*.ngrok-free.app',
    '*.ngrok-free.dev',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
};

export default nextConfig;
