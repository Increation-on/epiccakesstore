import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/products/[id]/reviews
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const reviews = await prisma.review.findMany({
            where: {
                productId: id,
                status: 'approved', // показываем только одобренные
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })



        return NextResponse.json(reviews)
    } catch (error) {
        console.error('GET /api/products/[id]/reviews error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

// POST /api/products/[id]/reviews
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            )
        }



        const { id } = await params


        const hasPurchased = await prisma.order.findFirst({
            where: {
                userId: session.user.id,
                status: { in: ['PAID', 'DELIVERED'] },
                orderItems: {
                    some: {
                        productId: id,
                    },
                },
            },
        })

        if (!hasPurchased) {
            return NextResponse.json(
                { error: 'Вы можете оставить отзыв только на купленный товар' },
                { status: 403 }
            )
        }
        const { rating, text } = await req.json()

        // Валидация
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Оценка должна быть от 1 до 5' },
                { status: 400 }
            )
        }

        if (!text || text.trim().length < 2) {
            return NextResponse.json(
                { error: 'Текст отзыва слишком короткий' },
                { status: 400 }
            )
        }

        // Проверяем, есть ли уже отзыв от этого пользователя на этот товар
        const existing = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId: id,
                },
            },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Вы уже оставляли отзыв на этот товар' },
                { status: 400 }
            )
        }

        // Создаём отзыв
        const review = await prisma.review.create({
            data: {
                rating,
                text,
                userId: session.user.id,
                productId: id,
                status: 'approved', // пока без модерации
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        })

        // После успешного создания отзыва
        try {
            const allReviews = await prisma.review.findMany({
                where: {
                    productId: id,
                    status: 'approved',
                },
            })
            console.log('🔥 allReviews length:', allReviews.length)
            console.log('🔥 allReviews data:', allReviews.map(r => ({ rating: r.rating, status: r.status })))
            const avg = allReviews.length > 0
                ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
                : 0

            await prisma.product.update({
                where: { id },
                data: { averageRating: avg },
            })

            const updated = await prisma.product.findUnique({
                where: { id },
                select: { averageRating: true }
            })
            console.log('🔥 после обновления:', updated)
        } catch (error) {
            console.error('❌ Ошибка при обновлении рейтинга:', error)

        }



        return NextResponse.json(review, { status: 201 })
    } catch (error) {
        console.error('POST /api/products/[id]/reviews error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}