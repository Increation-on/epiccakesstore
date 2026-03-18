import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

console.log('🔥 Env check:', {
  DATABASE_URL: !!process.env.DATABASE_URL,
  POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
  NODE_ENV: process.env.NODE_ENV
})

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL!

console.log('🔥 connectionString exists:', !!connectionString)
if (!connectionString) {
  throw new Error('❌ DATABASE_URL is not set')
}

// ✅ Передаём строку подключения напрямую в адаптер, без Pool
const adapter = new PrismaNeon({ connectionString })

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma