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
    console.log('📦 [API] POST /api/cart - START')
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log('❌ [API] No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('👤 [API] User:', session.user.id)

    const { items } = await req.json()
    console.log('📦 [API] Items to save:', JSON.stringify(items, null, 2))
    
    if (!items || !Array.isArray(items)) {
      console.log('❌ [API] Invalid data')
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Группируем дубликаты
    const groupedItems = items.reduce((acc: any[], item: any) => {
      const existing = acc.find(i => i.productId === item.productId)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        acc.push({ ...item })
      }
      return acc
    }, [])
    
    console.log('📦 Grouped items:', JSON.stringify(groupedItems, null, 2))

    // Используем транзакцию
    await prisma.$transaction(async (tx) => {
      // Находим или создаём корзину
      let cart = await tx.cart.findUnique({
        where: { userId: session.user.id }
      })

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId: session.user.id }
        })
        console.log('🆕 Cart created:', cart.id)
      } else {
        console.log('✅ Cart found:', cart.id)
      }

      // Удаляем все старые товары
      const deleted = await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      })
      console.log('🗑️ Deleted items count:', deleted.count)

      // Создаём новые
      if (groupedItems.length > 0) {
        const created = await tx.cartItem.createMany({
          data: groupedItems.map((item: any) => ({
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity
          }))
        })
        console.log('✅ Created items count:', created.count)
      }
    })

    console.log('✅ Cart update completed successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}