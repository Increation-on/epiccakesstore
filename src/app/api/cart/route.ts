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

    // Группируем дубликаты
    const itemsMap = new Map()
    for (const item of items) {
      const existing = itemsMap.get(item.productId)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        itemsMap.set(item.productId, { ...item })
      }
    }
    const groupedItems = Array.from(itemsMap.values())

    await prisma.$transaction(async (tx) => {
      let cart = await tx.cart.findUnique({
        where: { userId: session.user.id }
      })

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId: session.user.id }
        })
      }

      // Используем upsert вместо deleteMany + createMany
      for (const item of groupedItems) {
        await tx.cartItem.upsert({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: item.productId
            }
          },
          update: {
            quantity: item.quantity
          },
          create: {
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity
          }
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}