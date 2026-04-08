// src/lib/prisma.test.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, it, expect } from 'vitest'  // ← добавить импорт

const envPath = resolve(process.cwd(), '.env.test')
const envContent = readFileSync(envPath, 'utf-8')
const envLines = envContent.split('\n')

let connectionString = ''
for (const line of envLines) {
  if (line.startsWith('DATABASE_URL=')) {
    connectionString = line.split('=')[1].replace(/"/g, '').trim()
    break
  }
}

if (!connectionString) {
  throw new Error('❌ DATABASE_URL not found in .env.test')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

export const prismaTest = new PrismaClient({ adapter })

// Тесты после экспорта
describe('prismaTest', () => {
  it('should be defined', () => {
    expect(prismaTest).toBeDefined()
  })
})