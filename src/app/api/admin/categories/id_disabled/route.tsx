// app/api/admin/categories/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'
// import { prisma } from '@/lib/prisma'
import slugify from 'slugify'

// GET /api/admin/categories/[id] - получить одну категорию
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const session = await getServerSession(authOptions)

    // if (session?.user?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    // }

    const { id } = await params

    // ✅ ВРЕМЕННО: возвращаем тестовые данные вместо prisma
    return NextResponse.json({ 
      id: id,
      name: "Тестовая категория",
      slug: "test-category",
      products: []
    })

    /* ❌ Временно убираем запросы к БД
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
    */
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// PUT - тоже закомментируй всё и возвращай тестовые данные
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const session = await getServerSession(authOptions)

    // if (session?.user?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    // }

    const { id } = await params
    const data = await request.json()

    // ✅ ВРЕМЕННО: тестовый ответ
    return NextResponse.json({ 
      id: id,
      name: data.name || "Обновленная категория",
      slug: data.slug || "updated-category"
    })

  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// DELETE - и здесь тоже
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const session = await getServerSession(authOptions)

    // if (session?.user?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    // }

    const { id } = await params

    // ✅ ВРЕМЕННО: просто возвращаем успех
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}