import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Убираем TEST_DATABASE_URL отсюда, оставляем только продуктовые
    url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
  },
});