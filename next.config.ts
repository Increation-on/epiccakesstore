import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Игнорируем ошибки TypeScript при билде на Vercel
    ignoreBuildErrors: true,
  },
  // 👇 ЭТО КРИТИЧЕСКИ ВАЖНО!
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
  },
};

export default nextConfig;