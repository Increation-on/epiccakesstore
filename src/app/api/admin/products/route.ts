// app/api/admin/products/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/admin/products - получить все товары
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Проверка прав (на всякий случай, хотя middleware защищает)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const products = await prisma.product.findMany({
      include: {
        categories: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// POST /api/admin/products - создать товар
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const data = await request.json()
    
    // Валидация
    if (!data.name || !data.price) {
      return NextResponse.json(
        { error: 'Название и цена обязательны' },
        { status: 400 }
      )
    }

    // Создаём slug, если не передан
    const slug = data.slug || data.name.toLowerCase()
      .replace(/[^\w\s-]/g, '') // убираем спецсимволы
      .replace(/\s+/g, '-')      // пробелы на дефисы
      .replace(/--+/g, '-')       // убираем двойные дефисы

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: slug,
        description: data.description || '',
        price: parseFloat(data.price),
        images: data.images || '[]',
        inStock: data.inStock ?? true,
        // Связь с категориями
        categories: {
          connect: data.categoryIds?.map((id: string) => ({ id })) || []
        }
      },
      include: {
        categories: true
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}