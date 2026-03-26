import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
        inStock: true, // только те, что в наличии
      },
      take: 5, // максимум 5 результатов
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Парсим изображения для каждого товара
    const formattedProducts = products.map(product => ({
      ...product,
      image: product.images ? (
        typeof product.images === 'string'
          ? JSON.parse(product.images)[0]
          : product.images[0]
      ) : null,
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Ошибка поиска' }, { status: 500 })
  }
}