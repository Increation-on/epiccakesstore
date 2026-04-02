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
      },
      where: {
        isArchived: false 
      },
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

// POST - создать товар
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const data = await request.json()

    if (!data.name || !data.price) {
      return NextResponse.json(
        { error: 'Название и цена обязательны' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || '',
        price: parseFloat(data.price),
        images: data.images || '[]',
        inStock: data.inStock ?? true,
        stock: data.stock ?? 0,
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