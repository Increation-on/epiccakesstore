import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ review: null })
    }

    const { id } = await params

    const review = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: id,
        },
      },
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error('my-review error:', error)
    return NextResponse.json({ review: null })
  }
}