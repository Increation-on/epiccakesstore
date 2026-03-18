import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Логируем наличие URL (но не сам URL, чтобы не светить)
console.log('[Prisma] DATABASE_URL present:', !!process.env.DATABASE_URL)
console.log('[Prisma] POSTGRES_PRISMA_URL present:', !!process.env.POSTGRES_PRISMA_URL)

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma