// app/api/cart/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// app/api/cart/route.ts

export async function GET() {
  console.log('1. Начинаем GET /api/cart')
  
  const session = await getServerSession(authOptions)
  console.log('2. Session:', JSON.stringify(session, null, 2))
  
  if (!session?.user?.id) {
    console.log('3. Нет userId, возвращаем 401')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                inStock: true
              }
            }
          }
        }
      }
    })

    console.log('4. Найдена корзина:', cart?.items?.length || 0, 'товаров')
    return NextResponse.json(cart?.items || [])
    
  } catch (error) {
    console.error('5. Ошибка:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  console.log('1. Начинаем POST /api/cart')
  
  const session = await getServerSession(authOptions)
  console.log('2. Session:', JSON.stringify(session, null, 2))
  
  if (!session?.user?.id) {
    console.log('3. Нет userId, возвращаем 401')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) // ✅ есть return
  }

  try {
    const { items } = await request.json()
    console.log('4. Получены items:', items)

    const result = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { userId: session.user.id },
        update: {},
        create: { userId: session.user.id }
      })

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      })

      if (items?.length > 0) {
        await tx.cartItem.createMany({
          data: items.map((item: any) => ({
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity
          }))
        })
      }

      return tx.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: true,
                  inStock: true
                }
              }
            }
          }
        }
      })
    })

    console.log('5. Успешно сохранено')
    return NextResponse.json(result?.items || []) // ✅ есть return

  } catch (error) {
    console.error('6. Ошибка:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ) // ✅ есть return
  }
}