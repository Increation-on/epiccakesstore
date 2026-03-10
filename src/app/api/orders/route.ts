import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    
    const { fullName, email, phone, address, paymentMethod, items, total } = body
    
    // Создаём заказ в БД
    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id, // может быть undefined для гостей
        fullName,
        email,
        phone,
        address,
        paymentMethod,
        total,
        status: 'pending',
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.name,
            productPrice: item.price,
            quantity: item.quantity
          }))
        }
      },
      include: {
        orderItems: true
      }
    })
    
    // Если пользователь авторизован - очищаем корзину
    if (session?.user?.id) {
      await prisma.cart.deleteMany({
        where: { userId: session.user.id }
      })
    }
    
    return NextResponse.json({ 
      message: 'Заказ создан',
      orderId: order.id 
    }, { status: 201 })
    
  } catch (error) {
    console.error('Ошибка создания заказа:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}