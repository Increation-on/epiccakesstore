// __tests__/integration/setup.ts
import { afterAll, beforeAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'

// Мок Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
    cart: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    order: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  }
}))

// Мок сессии
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user', email: 'test@example.com', role: 'user' },
    expires: new Date().toISOString(),
  })),
}))