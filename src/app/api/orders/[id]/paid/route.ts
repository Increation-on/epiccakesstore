import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🔵 [API paid] === НАЧАЛО ===')
  
  try {
    const session = await getServerSession(authOptions)
    console.log('🔵 [API paid] Session:', session?.user?.email || 'no session')
    
    const { id } = await params
    console.log('🔵 [API paid] Order ID:', id)

    if (!id) {
      console.log('🔴 [API paid] Нет Order ID')
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Получаем заказ с товарами
    console.log('🔵 [API paid] Ищем заказ...')
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                stock: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      console.log('🔴 [API paid] Заказ не найден')
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    console.log('🔵 [API paid] Заказ найден, статус:', order.status)
    console.log('🔵 [API paid] Товаров в заказе:', order.orderItems.length)

    // Проверяем, не обработан ли уже заказ
    if (order.status === 'PAID') {
      console.log('🔴 [API paid] Заказ уже оплачен')
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 })
    }

    // Транзакция: проверяем наличие и уменьшаем stock
    console.log('🔵 [API paid] Начинаем транзакцию...')
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Проверяем наличие всех товаров
      for (const item of order.orderItems) {
        console.log(`🔵 [API paid] Проверяем товар: ${item.productName}, нужно: ${item.quantity}`)
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true }
        })

        if (!product || product.stock < item.quantity) {
          console.log(`🔴 [API paid] Недостаточно товара: ${product?.name}, доступно: ${product?.stock || 0}, нужно: ${item.quantity}`)
          throw new Error(
            `Товар "${product?.name || item.productName}" доступен в количестве ${product?.stock || 0} шт`
          )
        }
        console.log(`🟢 [API paid] Товар доступен, stock: ${product.stock}`)
      }

      // 2. Уменьшаем stock
      for (const item of order.orderItems) {
        console.log(`🔵 [API paid] Уменьшаем stock для: ${item.productName}, на: ${item.quantity}`)
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        })
      }

      // 3. Обновляем статус заказа
      console.log('🔵 [API paid] Обновляем статус заказа на PAID')
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: 'PAID',
          updatedAt: new Date()
        }
      })

      return updated
    })

    console.log('🟢 [API paid] Транзакция успешна, статус заказа:', updatedOrder.status)

    // 4. После транзакции обновляем inStock для товаров, где stock стал 0
    console.log('🔵 [API paid] Обновляем inStock для товаров с stock=0')
    const updateResult = await prisma.product.updateMany({
      where: { stock: 0 },
      data: { inStock: false }
    })
    console.log(`🟢 [API paid] Обновлено ${updateResult.count} товаров`)

    // 5. Очищаем корзину пользователя
    if (order.userId) {
      console.log('🔵 [API paid] Очищаем корзину пользователя:', order.userId)
      await prisma.cart.deleteMany({
        where: { userId: order.userId }
      })
    }

    console.log('🟢 [API paid] === УСПЕХ ===')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('🔴 [API paid] Ошибка:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}