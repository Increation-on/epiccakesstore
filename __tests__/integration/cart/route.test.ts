// __tests__/integration/api/cart/route.test.ts
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { prismaTest } from '@/lib/prisma.test'

vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn()
}))

vi.mock('@/lib/prisma', async () => {
  return {
    prisma: prismaTest,
    default: prismaTest
  }
})

vi.mock('@/lib/auth', () => ({
  authOptions: {
    providers: [],
    secret: 'test-secret'
  }
}))

describe('Cart API', () => {
  const uniqueId = Date.now()
  const mockUserId = `test-user-${uniqueId}`
  const productId = `prod-${uniqueId}`
  const categoryId = `cat-${uniqueId}`

  beforeAll(async () => {
    const { getServerSession } = await import('next-auth')
    ;(getServerSession as any).mockResolvedValue({
      user: { id: mockUserId, email: `test${uniqueId}@example.com` }
    })

    // Создаём тестового пользователя
    await prismaTest.user.create({
      data: {
        id: mockUserId,
        email: `test${uniqueId}@example.com`,
        role: 'user'
      }
    })

    // Создаём категорию
    await prismaTest.category.create({
      data: { id: categoryId, name: 'Торты' }
    })

    // Создаём товар
    await prismaTest.product.create({
      data: {
        id: productId,
        name: 'Торт',
        price: 1000,
        stock: 10,
        images: '[]',
        description: 'Вкусный торт',
        categories: { connect: { id: categoryId } }
      }
    })
  })

  it('GET /api/cart — возвращает пустую корзину для нового пользователя', async () => {
    const { GET } = await import('@/app/api/cart/route')
    
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })

  it('POST /api/cart — добавляет товары в корзину', async () => {
    const { POST, GET } = await import('@/app/api/cart/route')
    const { NextRequest } = await import('next/server')

    const items = [
      { id: `item-${uniqueId}`, productId, quantity: 2, addedAt: new Date().toISOString() }
    ]

    const request = new NextRequest('http://localhost:3000/api/cart', {
      method: 'POST',
      body: JSON.stringify({ items })
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const getResponse = await GET()
    const data = await getResponse.json()

    expect(data).toHaveLength(1)
    expect(data[0].productId).toBe(productId)
    expect(data[0].quantity).toBe(2)
  })

  it('DELETE /api/cart — очищает корзину', async () => {
    const { DELETE, GET } = await import('@/app/api/cart/route')
    
    const response = await DELETE()
    expect(response.status).toBe(200)

    const getResponse = await GET()
    const data = await getResponse.json()

    expect(data).toEqual([])
  })
})