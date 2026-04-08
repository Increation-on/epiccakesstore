// __tests__/integration/api/products/by-ids/route.test.ts
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { prismaTest } from '@/lib/prisma.test'

vi.mock('@/lib/prisma', async () => {
  return {
    prisma: prismaTest,
    default: prismaTest
  }
})

describe('POST /api/products/by-ids', () => {
  let prod1Id: string
  let prod2Id: string
  let prod3Id: string
  let categoryId: string

  beforeAll(async () => {
    const uniqueId = Date.now()
    categoryId = `cat-${uniqueId}`
    prod1Id = `prod-1-${uniqueId}`
    prod2Id = `prod-2-${uniqueId}`
    prod3Id = `prod-3-${uniqueId}`
    
    // Создаём категорию
    await prismaTest.category.create({
      data: { id: categoryId, name: 'Торты' }
    })

    // Создаём товары
    await prismaTest.product.create({
      data: {
        id: prod1Id,
        name: 'Торт',
        price: 1000,
        stock: 10,
        inStock: true,
        isArchived: false,
        images: '[]',
        description: 'Вкусный торт',
        categories: { connect: { id: categoryId } }
      }
    })

    await prismaTest.product.create({
      data: {
        id: prod2Id,
        name: 'Пирожное',
        price: 500,
        stock: 20,
        inStock: true,
        isArchived: false,
        images: '[]',
        description: 'Вкусное пирожное',
        categories: { connect: { id: categoryId } }
      }
    })

    await prismaTest.product.create({
      data: {
        id: prod3Id,
        name: 'Архивный торт',
        price: 3000,
        stock: 0,
        inStock: false,
        isArchived: true,
        images: '[]',
        description: 'Архивный торт',
        categories: { connect: { id: categoryId } }
      }
    })
  })

  it('возвращает товары по списку ids', async () => {
    const { POST } = await import('@/app/api/products/by-ids/route')
    const { NextRequest } = await import('next/server')

    const request = new NextRequest('http://localhost:3000/api/products/by-ids', {
      method: 'POST',
      body: JSON.stringify({ ids: [prod1Id, prod2Id] })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)
  })

  it('возвращает пустой массив если ids пустой', async () => {
    const { POST } = await import('@/app/api/products/by-ids/route')
    const { NextRequest } = await import('next/server')

    const request = new NextRequest('http://localhost:3000/api/products/by-ids', {
      method: 'POST',
      body: JSON.stringify({ ids: [] })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(0)
  })

  it('возвращает 400 если ids не передан', async () => {
    const { POST } = await import('@/app/api/products/by-ids/route')
    const { NextRequest } = await import('next/server')

    const request = new NextRequest('http://localhost:3000/api/products/by-ids', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('возвращает 400 если ids не массив', async () => {
    const { POST } = await import('@/app/api/products/by-ids/route')
    const { NextRequest } = await import('next/server')

    const request = new NextRequest('http://localhost:3000/api/products/by-ids', {
      method: 'POST',
      body: JSON.stringify({ ids: 'not-array' })
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })
})