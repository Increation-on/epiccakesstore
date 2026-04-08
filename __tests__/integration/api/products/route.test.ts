// __tests__/integration/api/products/route.test.ts
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { prismaTest } from '@/lib/prisma.test'

vi.mock('@/lib/prisma', async () => {
  return {
    prisma: prismaTest,
    default: prismaTest
  }
})

describe('GET /api/products', () => {
  beforeAll(async () => {
    await prismaTest.$executeRaw`TRUNCATE TABLE "Product" CASCADE;`
    await prismaTest.$executeRaw`TRUNCATE TABLE "Category" CASCADE;`
    
    // Создаём категории
    const cakeCat = await prismaTest.category.create({
      data: { id: 'cat-1', name: 'Торты' }
    })
    
    const pastryCat = await prismaTest.category.create({
      data: { id: 'cat-2', name: 'Пирожные' }
    })

    // Создаём продукты
    const prod1 = await prismaTest.product.create({
      data: {
        id: 'prod-1',
        name: 'Торт',
        price: 1000,
        stock: 10,
        isArchived: false,
        inStock: true,
        images: '[]',
        description: 'Вкусный торт',
        categories: { connect: { id: cakeCat.id } }
      }
    })

    const prod2 = await prismaTest.product.create({
      data: {
        id: 'prod-2',
        name: 'Пирожное',
        price: 500,
        stock: 20,
        isArchived: false,
        inStock: true,
        images: '[]',
        description: 'Вкусное пирожное',
        categories: { connect: { id: pastryCat.id } }
      }
    })

    const prod3 = await prismaTest.product.create({
      data: {
        id: 'prod-3',
        name: 'Архивный торт',
        price: 3000,
        stock: 0,
        isArchived: true,
        inStock: false,
        images: '[]',
        description: 'Архивный торт',
        categories: { connect: { id: cakeCat.id } }
      }
    })

    
    // Проверяем что реально в БД
    const allProducts = await prismaTest.product.findMany()
    
    const nonArchived = await prismaTest.product.findMany({ where: { isArchived: false } })
  })

  it('возвращает только неархивные товары', async () => {
    // Проверяем prisma перед вызовом API
    const checkPrisma = await import('@/lib/prisma')
    
    const testProducts = await checkPrisma.prisma.product.findMany()
    
    const { GET } = await import('@/app/api/products/route')
    const { NextRequest } = await import('next/server')
    
    const request = new NextRequest('http://localhost:3000/api/products')
    const response = await GET(request)
    const data = await response.json()
        
    expect(response.status).toBe(200)
    expect(data.products).toHaveLength(2)
    expect(data.products.find((p: any) => p.name === 'Архивный торт')).toBeUndefined()
  })
})