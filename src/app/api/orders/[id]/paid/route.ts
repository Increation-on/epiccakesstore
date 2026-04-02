import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  
  try {
    const session = await getServerSession(authOptions)    
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Получаем заказ с товарами
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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    // Проверяем, не обработан ли уже заказ
    if (order.status === 'PAID') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 })
    }

    // Транзакция: проверяем наличие и уменьшаем stock
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Проверяем наличие всех товаров
      for (const item of order.orderItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true }
        })

        if (!product || product.stock < item.quantity) {
          throw new Error(
            `Товар "${product?.name || item.productName}" доступен в количестве ${product?.stock || 0} шт`
          )
        }
      }

      // 2. Уменьшаем stock
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        })
      }

      // 3. Обновляем статус заказа
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: 'PAID',
          updatedAt: new Date()
        }
      })

      return updated
    })
    // 4. После транзакции обновляем inStock для товаров, где stock стал 0
    const updateResult = await prisma.product.updateMany({
      where: { stock: 0 },
      data: { inStock: false }
    })
    // 5. Очищаем корзину пользователя
    if (order.userId) {
      await prisma.cart.deleteMany({
        where: { userId: order.userId }
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('🔴 [API paid] Ошибка:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}