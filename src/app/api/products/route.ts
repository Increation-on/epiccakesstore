// app/api/products/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const searchQuery = searchParams.get('search') || '';
    const categoryId = searchParams.get('category');  // новый параметр
    const limit = 12;
    const skip = (page - 1) * limit;

    // Собираем условия where
    const where: any = {};
    
    // Поиск по тексту
    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery } },
        { description: { contains: searchQuery } }
      ];
    }
    
    // Фильтр по категории
    if (categoryId) {
      where.categories = {
        some: { id: categoryId }
      };
    }

    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { categories: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      products,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}