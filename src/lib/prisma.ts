import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Создаём клиент с правильной конфигурацией для Prisma 7
const createPrismaClient = () => {
  const databaseUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.warn('⚠️ DATABASE_URL not found, using dummy client for build')
    // Для билда возвращаем пустой объект
    return {} as PrismaClient
  }

  // В Prisma 7 URL передаётся через конструктор, но без datasources
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma