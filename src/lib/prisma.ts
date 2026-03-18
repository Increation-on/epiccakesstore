import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

// ✅ Создаём pool с правильным объектом конфигурации
const pool = new Pool({ 
  connectionString 
})

// ✅ Используем 'as any' для обхода проверки типов
const adapter = new PrismaNeon(pool as any)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma