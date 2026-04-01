import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const archivedProducts = await prisma.product.findMany({
      where: { isArchived: true },
      include: { categories: true },
      orderBy: { archivedAt: 'desc' }
    })

    return NextResponse.json(archivedProducts)
  } catch (error) {
    console.error('Error fetching archived products:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}