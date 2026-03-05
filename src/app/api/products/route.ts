// app/api/products/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const searchQuery = searchParams.get('search') || '';
    const categoryId = searchParams.get('category');
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice'); 
    const limit = 12;
    const skip = (page - 1) * limit;
    const inStock = searchParams.get('inStock') === 'true';

    // Настройка сортировки
    let orderBy = {};
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Собираем условия where
    const where: any = {};

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery } },
        { description: { contains: searchQuery } }
      ];
    }

    if (categoryId) {
      where.categories = {
        some: { id: categoryId }
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    // ✅ Добавляем фильтр "только в наличии"
    if (inStock) {
      where.inStock = true;
    }

    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { categories: true },
        skip,
        take: limit,
        orderBy
      }),
      prisma.product.count({ where })
    ]);

    // Преобразуем images из JSON в массив
    const formattedProducts = products.map(p => ({
      ...p,
      imageUrls: JSON.parse(p.images || '[]')
    }));

    return NextResponse.json({
      products: formattedProducts,  // ✅ правильное имя
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