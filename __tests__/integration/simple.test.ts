// __tests__/integration/simple.test.ts
import { describe, it, expect } from 'vitest'
import { prismaTest } from '@/lib/prisma.test'

describe('БД работает', () => {
  it('должен подключиться и выполнить запрос', async () => {
    const result = await prismaTest.$queryRaw`SELECT 1 as test`
    expect(result).toBeDefined()
  })
})