import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('❌ DATABASE_URL is not set!')
}

// ✅ Создаём пул и адаптер напрямую, без глобальных объектов
const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)

// ✅ Экспортируем клиент, который создаётся с адаптером
export const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
})

// В продакшене глобальный объект не нужен