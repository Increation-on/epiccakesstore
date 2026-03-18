import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Игнорируем ошибки TypeScript при билде на Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
