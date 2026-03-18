import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL!

console.log('🔥 [prisma] connectionString exists:', !!connectionString)
console.log('🔥 [prisma] adapter created')

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const adapter = new PrismaNeon({ connectionString })

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

console.log('🔥 [prisma] client created')