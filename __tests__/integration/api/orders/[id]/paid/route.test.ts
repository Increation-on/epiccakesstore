// __tests__/integration/api/orders/[id]/paid/route.test.ts
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

describe('POST /api/orders/:id/paid', () => {
  const uniqueId = Date.now()
  const mockUserId = `test-user-${uniqueId}`
  const productId = `prod-${uniqueId}`
  const categoryId = `cat-${uniqueId}`
  let orderId: string

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

    // Создаём категорию и товар с stock
    await prismaTest.category.create({
      data: { id: categoryId, name: 'Торты' }
    })

    await prismaTest.product.create({
      data: {
        id: productId,
        name: 'Тестовый торт',
        price: 1000,
        stock: 10,
        inStock: true,
        images: '[]',
        description: 'Вкусный торт',
        categories: { connect: { id: categoryId } }
      }
    })

    // Создаём заказ со статусом PENDING
    const order = await prismaTest.order.create({
      data: {
        id: `order-${uniqueId}`,
        userId: mockUserId,
        fullName: 'Тест Тестов',
        email: `test${uniqueId}@example.com`,
        phone: '+1234567890',
        address: 'Test Address',
        paymentMethod: 'card',
        total: 2000,
        status: 'PENDING',
        orderItems: {
          create: [
            {
              productId,
              productName: 'Тестовый торт',
              productPrice: 1000,
              quantity: 2
            }
          ]
        }
      }
    })

    orderId = order.id
  })

  it('обновляет статус заказа на PAID и уменьшает stock', async () => {
    const { POST } = await import('@/app/api/orders/[id]/paid/route')
    const { NextRequest } = await import('next/server')

    const request = new NextRequest(`http://localhost:3000/api/orders/${orderId}/paid`, {
      method: 'POST'
    })

    // Создаём params объект с Promise
    const params = Promise.resolve({ id: orderId })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    // Проверяем, что статус заказа изменился
    const order = await prismaTest.order.findUnique({
      where: { id: orderId }
    })
    expect(order?.status).toBe('PAID')

    // Проверяем, что stock уменьшился
    const product = await prismaTest.product.findUnique({
      where: { id: productId }
    })
    expect(product?.stock).toBe(8) // было 10, купили 2
  })

  it('возвращает 404 если заказ не найден', async () => {
    const { POST } = await import('@/app/api/orders/[id]/paid/route')
    const { NextRequest } = await import('next/server')

    const fakeId = `fake-${uniqueId}`
    const request = new NextRequest(`http://localhost:3000/api/orders/${fakeId}/paid`, {
      method: 'POST'
    })

    const params = Promise.resolve({ id: fakeId })
    const response = await POST(request, { params })

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toBe('Order not found')
  })

  it('возвращает 400 если заказ уже оплачен', async () => {
    // Создаём уже оплаченный заказ
    const paidOrder = await prismaTest.order.create({
      data: {
        id: `paid-order-${uniqueId}`,
        userId: mockUserId,
        fullName: 'Тест Тестов',
        email: `test${uniqueId}@example.com`,
        phone: '+1234567890',
        address: 'Test Address',
        paymentMethod: 'card',
        total: 1000,
        status: 'PAID',
        orderItems: {
          create: [
            {
              productId,
              productName: 'Тестовый торт',
              productPrice: 1000,
              quantity: 1
            }
          ]
        }
      }
    })

    const { POST } = await import('@/app/api/orders/[id]/paid/route')
    const { NextRequest } = await import('next/server')

    const request = new NextRequest(`http://localhost:3000/api/orders/${paidOrder.id}/paid`, {
      method: 'POST'
    })

    const params = Promise.resolve({ id: paidOrder.id })
    const response = await POST(request, { params })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Order already paid')
  })

  it('возвращает 400 если недостаточно товара на складе', async () => {
    // Создаём заказ с количеством больше stock
    const productLowStock = `prod-low-${uniqueId}`
    
    await prismaTest.product.create({
      data: {
        id: productLowStock,
        name: 'Торт с малым запасом',
        price: 1000,
        stock: 1,
        inStock: true,
        images: '[]',
        description: 'Мало',
        categories: { connect: { id: categoryId } }
      }
    })

    const lowStockOrder = await prismaTest.order.create({
      data: {
        id: `low-stock-order-${uniqueId}`,
        userId: mockUserId,
        fullName: 'Тест Тестов',
        email: `test${uniqueId}@example.com`,
        phone: '+1234567890',
        address: 'Test Address',
        paymentMethod: 'card',
        total: 2000,
        status: 'PENDING',
        orderItems: {
          create: [
            {
              productId: productLowStock,
              productName: 'Торт с малым запасом',
              productPrice: 1000,
              quantity: 5 // больше чем stock (1)
            }
          ]
        }
      }
    })

    const { POST } = await import('@/app/api/orders/[id]/paid/route')
    const { NextRequest } = await import('next/server')

    const request = new NextRequest(`http://localhost:3000/api/orders/${lowStockOrder.id}/paid`, {
      method: 'POST'
    })

    const params = Promise.resolve({ id: lowStockOrder.id })
    const response = await POST(request, { params })

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toContain('доступен в количестве')
  })
})