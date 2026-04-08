import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Фабрика для создания клиента с кастомным URL
export function createPrismaClient(dbUrl?: string) {
  const connectionString = dbUrl || 
    process.env.POSTGRES_PRISMA_URL || 
    process.env.DATABASE_URL
  
  if (!connectionString) {
    throw new Error('Database URL is required')
  }
  
  const adapter = new PrismaNeon({ connectionString })
  return new PrismaClient({ adapter })
}

// Singleton для продакшена
const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { prisma }
export default prisma