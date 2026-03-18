import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

console.log('🔥 [prisma] Starting initialization...')
console.log('🔥 [prisma] NODE_ENV:', process.env.NODE_ENV)
console.log('🔥 [prisma] DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('🔥 [prisma] POSTGRES_PRISMA_URL exists:', !!process.env.POSTGRES_PRISMA_URL)

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL!

if (!connectionString) {
  console.error('❌ [prisma] DATABASE_URL is not set!')
  throw new Error('DATABASE_URL is not set')
}

console.log('🔥 [prisma] Connection string obtained, creating adapter...')

// Создаём адаптер
const adapter = new PrismaNeon({ connectionString })
console.log('🔥 [prisma] Adapter created successfully')

// ✅ Экспорт должен быть на верхнем уровне
export const prisma = new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
})

console.log('🔥 [prisma] Client created successfully')