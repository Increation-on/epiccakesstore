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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { items } = await request.json()
    console.log('4. Получены items:', JSON.stringify(items, null, 2))
    console.log('4a. Количество items:', items?.length)

    const result = await prisma.$transaction(async (tx) => {
      console.log('5. Начинаем транзакцию для user:', session.user.id)
      
      const cart = await tx.cart.upsert({
        where: { userId: session.user.id },
        update: {},
        create: { userId: session.user.id }
      })
      console.log('6. Cart после upsert:', cart)

      const deleted = await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      })
      console.log('7. Удалено старых items:', deleted.count)

      if (items?.length > 0) {
        const created = await tx.cartItem.createMany({
          data: items.map((item: any) => ({
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity
          }))
        })
        console.log('8. Создано новых items:', created.count)
      }

      const finalCart = await tx.cart.findUnique({
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
      console.log('9. Финальная корзина:', finalCart?.items?.length, 'товаров')
      
      return finalCart
    })

    console.log('10. Успешно сохранено, возвращаем:', result?.items?.length, 'товаров')
    return NextResponse.json(result?.items || [])

  } catch (error) {
    console.error('11. Ошибка:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}