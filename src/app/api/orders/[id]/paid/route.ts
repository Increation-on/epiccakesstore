//api/orders/[id]/paid/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Сессия получается внутри обработчика
    const session = await getServerSession(authOptions)
    console.log('🔥 session в paid route:', session)

    const { id } = await params
    console.log('🔥 orderId:', id)

    if (!id) {
      console.log('❌ orderId отсутствует')
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    console.log('🔥 Ищем заказ с id:', id)
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })
    console.log('🔥 Найденный заказ:', existingOrder)

    if (!existingOrder) {
      console.log('❌ Заказ не найден')
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { 
        status: 'PAID',
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Заказ обновлён:', order)

    if (order.userId) {
      console.log('🔥 Очищаем корзину для userId:', order.userId)
      await prisma.cart.deleteMany({
        where: { userId: order.userId }
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Ошибка обновления статуса:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}