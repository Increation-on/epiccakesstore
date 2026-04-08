// __tests__/integration/api/orders/route.test.ts
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

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {
    providers: [],
    secret: 'test-secret'
  }
}))

describe('POST /api/orders', () => {
  const uniqueId = Date.now()
  const mockUserId = `test-user-${uniqueId}`
  const productId = `prod-${uniqueId}`
  const categoryId = `cat-${uniqueId}`

  beforeAll(async () => {
    const { getServerSession } = await import('next-auth')
    ;(getServerSession as any).mockResolvedValue({
      user: { id: mockUserId, email: `test${uniqueId}@example.com` }
    })

    // Создаём пользователя
    await prismaTest.user.create({
      data: {
        id: mockUserId,
        email: `test${uniqueId}@example.com`,
        role: 'user'
      }
    })

    // Создаём категорию и товар
    await prismaTest.category.create({
      data: { id: categoryId, name: 'Торты' }
    })

    await prismaTest.product.create({
      data: {
        id: productId,
        name: 'Тестовый торт',
        price: 1000,
        stock: 10,
        images: '[]',
        description: 'Вкусный торт',
        categories: { connect: { id: categoryId } }
      }
    })
  })

  it('создаёт заказ для авторизованного пользователя', async () => {
    const { POST } = await import('@/app/api/orders/route')
    const { NextRequest } = await import('next/server')

    const orderData = {
      fullName: 'Тест Тестов',
      email: `test${uniqueId}@example.com`,
      phone: '+1234567890',
      address: 'Test Address 123',
      paymentMethod: 'card',
      total: 2000,
      items: [
        {
          productId,
          name: 'Тестовый торт',
          price: 1000,
          quantity: 2
        }
      ]
    }

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('Заказ создан')
    expect(data.orderId).toBeDefined()

    // Проверяем, что заказ сохранился в БД
    const order = await prismaTest.order.findUnique({
      where: { id: data.orderId },
      include: { orderItems: true }
    })

    expect(order).toBeDefined()
    expect(order?.fullName).toBe(orderData.fullName)
    expect(order?.total).toBe(orderData.total)
    expect(order?.orderItems).toHaveLength(1)
    expect(order?.orderItems[0].quantity).toBe(2)
  })

  it('создаёт заказ с кастомным статусом', async () => {
    const { POST } = await import('@/app/api/orders/route')
    const { NextRequest } = await import('next/server')

    const orderData = {
      fullName: 'Тест Тестов',
      email: `test${uniqueId}@example.com`,
      phone: '+1234567890',
      address: 'Test Address 123',
      paymentMethod: 'cash',
      total: 1000,
      status: 'PAID',
      items: [
        {
          productId,
          name: 'Тестовый торт',
          price: 1000,
          quantity: 1
        }
      ]
    }

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    
    const order = await prismaTest.order.findUnique({
      where: { id: data.orderId }
    })

    expect(order?.status).toBe('PAID')
  })

  it('создаёт заказ для неавторизованного пользователя (userId = null)', async () => {
    const { getServerSession } = await import('next-auth')
    ;(getServerSession as any).mockResolvedValue(null)

    const { POST } = await import('@/app/api/orders/route')
    const { NextRequest } = await import('next/server')

    const orderData = {
      fullName: 'Гость Гостев',
      email: 'guest@example.com',
      phone: '+1234567890',
      address: 'Guest Address',
      paymentMethod: 'card',
      total: 1000,
      items: [
        {
          productId,
          name: 'Тестовый торт',
          price: 1000,
          quantity: 1
        }
      ]
    }

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    
    const order = await prismaTest.order.findUnique({
      where: { id: data.orderId }
    })

    expect(order?.userId).toBeNull()
    expect(order?.fullName).toBe('Гость Гостев')
  })
})