import { PrismaClient } from '@prisma/client'  // 👈 ЭТО НУЖНО ДОБАВИТЬ!
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)

export const prisma = globalForPrisma.prisma ?? new (PrismaClient as any)({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma