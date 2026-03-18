import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

// ✅ Правильно для последних версий: адаптер принимает объект с connectionString
const adapter = new PrismaNeon({
  connectionString,
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma