import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - загрузить корзину
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(cart?.items || [])
  } catch (error) {
    console.error('❌ GET cart error:', error)
    return NextResponse.json(
      { error: 'Failed to load cart' },
      { status: 500 }
    )
  }
}

// POST - полностью заменить корзину
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items } = await req.json()
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Находим или создаём корзину
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id }
      })
    }

    // Удаляем все старые товары
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })

    // Создаём новые
    await prisma.cartItem.createMany({
      data: items.map((item: any) => ({
        cartId: cart.id,
        productId: item.productId,
        quantity: item.quantity
      }))
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ POST cart error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}