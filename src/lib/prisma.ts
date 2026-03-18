import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Не создаём клиент сразу, а только при вызове
export function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    const url = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
    
    if (!url) {
      throw new Error('DATABASE_URL is not set')
    }
    
    globalForPrisma.prisma = new PrismaClient()
  }
  
  return globalForPrisma.prisma
}

// Для обратной совместимости
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const client = getPrismaClient()
    return client[prop as keyof PrismaClient]
  }
})