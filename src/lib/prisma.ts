import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

// Глобальная переменная для синглтона (только для dev режима)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Функция, которая гарантированно создает клиент с адаптером
function createPrismaClient() {
  const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('❌ DATABASE_URL is not set')
  }

  // Создаем пул и адаптер
  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool)

  // Создаем клиент с адаптером
  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  })
}

// Ленивая инициализация: клиент создается только при первом обращении
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    // Если клиент еще не создан в глобальной области (или мы не в проде)
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient()
    }
    // Возвращаем запрашиваемое свойство/метод
    return globalForPrisma.prisma[prop as keyof PrismaClient]
  },
})