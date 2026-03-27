import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    include: { product: { select: { name: true, id: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(reviews)
}