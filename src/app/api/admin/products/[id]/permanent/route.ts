// app/api/admin/products/[id]/permanent/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const { id } = await params

    // Проверяем, есть ли заказы с этим товаром
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: id },
      take: 1
    })

    if (orderItems.length > 0) {
      return NextResponse.json({ 
        error: 'Невозможно удалить товар, который есть в заказах' 
      }, { status: 400 })
    }

    // Удаляем товар из всех корзин
    await prisma.cartItem.deleteMany({
      where: { productId: id }
    })

    // Полное удаление товара
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error permanently deleting product:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}