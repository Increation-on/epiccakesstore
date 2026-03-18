import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Пробуем все возможные варианты
    url: process.env.POSTGRES_PRISMA_URL 
      || process.env.DATABASE_URL 
      || process.env.POSTGRES_URL_NON_POOLING
  },
});