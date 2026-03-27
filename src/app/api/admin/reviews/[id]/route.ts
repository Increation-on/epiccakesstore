import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const { id } = await params
  const { status } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'ID отзыва не указан' }, { status: 400 })
  }

  const review = await prisma.review.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json(review)
}