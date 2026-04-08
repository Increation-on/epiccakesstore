import { describe, it, expect, beforeAll, vi } from 'vitest'
import { prismaTest } from '@/lib/prisma.test'

// 🔥 Перехватываем импорт ДО загрузки API
vi.mock('@/lib/prisma', async () => {
  const actual = await vi.importActual<typeof import('@/lib/prisma')>('@/lib/prisma')
  return {
    ...actual,
    prisma: prismaTest, // Подменяем синглтон на тестовый клиент
    default: prismaTest
  }
})

describe('GET /api/products', () => {
  beforeAll(async () => {
    // Сидим данные через тестовый клиент
    const cakeCat = await prismaTest.category.create({
      data: { id: 'cat-1', name: 'Торты' }
    })
    const pastryCat = await prismaTest.category.create({
      data: { id: 'cat-2', name: 'Пирожные' }
    })

    await prismaTest.product.createMany({
      data: [
        {
          id: 'prod-1',
          name: 'Торт',
          price: 1000,
          stock: 10,
          isArchived: false,
          images: '[]',
          description: 'Вкусный торт',
        },
        {
          id: 'prod-2',
          name: 'Пирожное',
          price: 500,
          stock: 20,
          isArchived: false,
          images: '[]',
          description: 'Вкусное пирожное',
        },
        {
          id: 'prod-3',
          name: 'Архивный торт',
          price: 3000,
          stock: 0,
          isArchived: true,
          images: '[]',
          description: 'Архивный торт',
        }
      ]
    })

    // Связываем с категориями
    await prismaTest.product.update({
      where: { id: 'prod-1' },
      data: { categories: { connect: { id: cakeCat.id } } }
    })
    await prismaTest.product.update({
      where: { id: 'prod-2' },
      data: { categories: { connect: { id: pastryCat.id } } }
    })
    await prismaTest.product.update({
      where: { id: 'prod-3' },
      data: { categories: { connect: { id: cakeCat.id } } }
    })
  })

  it('возвращает только неархивные товары', async () => {
    // Теперь этот импорт получит prisma = prismaTest
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