// __tests__/integration/api/admin/products/route.test.ts
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { prismaTest } from '@/lib/prisma.test'

// Мокаем сессию с ролью admin
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

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {
    providers: [],
    secret: 'test-secret'
  }
}))

describe('Admin Products API', () => {
  const uniqueId = Date.now()
  const adminUserId = `admin-${uniqueId}`
  const categoryId = `cat-${uniqueId}`

  beforeAll(async () => {
    const { getServerSession } = await import('next-auth')
    ;(getServerSession as any).mockResolvedValue({
      user: { id: adminUserId, email: `admin${uniqueId}@example.com`, role: 'admin' }
    })

    // Создаём админа в БД
    await prismaTest.user.create({
      data: {
        id: adminUserId,
        email: `admin${uniqueId}@example.com`,
        role: 'admin'
      }
    })

    // Создаём категорию
    await prismaTest.category.create({
      data: { id: categoryId, name: 'Торты' }
    })
  })

  describe('GET /api/admin/products', () => {
    it('возвращает список товаров для админа', async () => {
      // Создаём тестовый товар
      await prismaTest.product.create({
        data: {
          id: `prod-get-${uniqueId}`,
          name: 'Торт для админа',
          price: 1000,
          stock: 10,
          images: '[]',
          description: 'Тестовый товар',
          categories: { connect: { id: categoryId } }
        }
      })

      const { GET } = await import('@/app/api/admin/products/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
    })

    it('возвращает 403 если пользователь не админ', async () => {
      const { getServerSession } = await import('next-auth')
      ;(getServerSession as any).mockResolvedValueOnce({
        user: { id: 'regular-user', role: 'user' }
      })

      const { GET } = await import('@/app/api/admin/products/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Недостаточно прав')
    })
  })

  describe('POST /api/admin/products', () => {
    it('создаёт новый товар', async () => {
      const { POST } = await import('@/app/api/admin/products/route')
      const { NextRequest } = await import('next/server')

      const productData = {
        name: 'Новый торт',
        description: 'Очень вкусный',
        price: 1500,
        stock: 5,
        inStock: true,
        images: '["image1.jpg"]',
        categoryIds: [categoryId]
      }

      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.name).toBe(productData.name)
      expect(data.price).toBe(productData.price)
      expect(data.stock).toBe(productData.stock)
      expect(data.categories[0].id).toBe(categoryId)
    })

    it('возвращает 400 если нет названия', async () => {
      const { POST } = await import('@/app/api/admin/products/route')
      const { NextRequest } = await import('next/server')

      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({ price: 1000 })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Название и цена обязательны')
    })

    it('возвращает 400 если нет цены', async () => {
      const { POST } = await import('@/app/api/admin/products/route')
      const { NextRequest } = await import('next/server')

      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Торт' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Название и цена обязательны')
    })

    it('возвращает 403 если пользователь не админ', async () => {
      const { getServerSession } = await import('next-auth')
      ;(getServerSession as any).mockResolvedValueOnce({
        user: { id: 'regular-user', role: 'user' }
      })

      const { POST } = await import('@/app/api/admin/products/route')
      const { NextRequest } = await import('next/server')

      const request = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Торт', price: 1000 })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Недостаточно прав')
    })
  })
})