import { beforeAll, afterAll, afterEach } from 'vitest'
import { execSync } from 'child_process'
import { prismaTest } from '@/lib/prisma.test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

beforeAll(async () => {
  const envPath = resolve(process.cwd(), '.env.test')
  const envContent = readFileSync(envPath, 'utf-8')
  const envLines = envContent.split('\n')
  
  let url = ''
  for (const line of envLines) {
    if (line.startsWith('DATABASE_URL=')) {
      url = line.split('=')[1].replace(/"/g, '').trim()
      break
    }
  }
  
  if (!url) {
    throw new Error('❌ DATABASE_URL not set')
  }
  
  execSync('npx prisma db push', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit'
  })
})

afterEach(async () => {
  const tables = await prismaTest.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `
  
  for (const { tablename } of tables) {
    if (tablename !== '_prisma_migrations') {
      await prismaTest.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE`)
    }
  }
})

afterAll(async () => {
  await prismaTest.$disconnect()
})