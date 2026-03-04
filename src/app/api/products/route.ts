// app/api/products/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = Number(searchParams.get('page')) || 1;  // какую страницу просят
        const limit = 12;  // сколько товаров на странице
        const skip = (page - 1) * limit;  // сколько пропустить

        const [products, totalCount] = await prisma.$transaction([
            prisma.product.findMany({
                include: { categories: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count()
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