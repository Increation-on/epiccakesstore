import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id: productId } = await params

  // Если не авторизован — возвращаем null
  if (!session?.user?.id) {
    return NextResponse.json({ review: null })
  }

  const review = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: productId,
      },
    },
    select: {
      id: true,
      rating: true,
      text: true,
      status: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ review: review || null })
}