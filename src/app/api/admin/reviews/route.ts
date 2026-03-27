import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const where: any = {}
  if (status && status !== 'all') {
    where.status = status
  }

  const reviews = await prisma.review.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(reviews)
}