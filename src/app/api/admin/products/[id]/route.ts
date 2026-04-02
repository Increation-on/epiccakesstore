// app/api/admin/products/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/admin/products/[id] - получить один товар
export async function GET(
  request: Request,
   { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/products/[id] - обновить товар
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const { id } = await params
    const data = await request.json()

    // Валидация
    if (!data.name || !data.price) {
      return NextResponse.json(
        { error: 'Название и цена обязательны' },
        { status: 400 }
      )
    }

    // Обновляем товар
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || '',
        price: parseFloat(data.price),
        images: data.images || '[]',
        inStock: data.inStock ?? true,
        stock: data.stock ?? 0,
        categories: {
          set: data.categoryIds?.map((id: string) => ({ id })) || []
        }
      },
      include: {
        categories: true
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// DELETE - удалить товар (архивировать)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const { id } = await params

    // Архивируем товар вместо удаления
    await prisma.product.update({
      where: { id },
      data: { 
        isArchived: true,
        archivedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error archiving product:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}