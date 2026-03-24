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

// POST метод
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items } = await req.json()
    
    // Если items пустой — удаляем всё
    if (!items || items.length === 0) {
      await prisma.cartItem.deleteMany({
        where: { cart: { userId: session.user.id } }
      })
      return NextResponse.json({ success: true })
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

    // Находим или создаём корзину
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id }
      })
    }

    // Обновляем или создаём каждый товар
    for (const item of groupedItems) {
      await prisma.cartItem.upsert({
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}