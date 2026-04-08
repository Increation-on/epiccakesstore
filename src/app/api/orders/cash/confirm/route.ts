import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    
    const { formData, items, total } = body
    
    // Запускаем транзакцию
    const result = await prisma.$transaction(async (tx) => {
      // 1. Проверяем наличие товаров на складе
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })
        
        if (!product) {
          throw new Error(`Товар ${item.name} не найден`)
        }
        
        if (product.stock < item.quantity) {
          throw new Error(`Недостаточно товара: ${item.name}. Осталось: ${product.stock}`)
        }
      }
      
      // 2. Создаём заказ
      const order = await tx.order.create({
        data: {
          userId: session?.user?.id,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          paymentMethod: 'cash',
          total: total,
          status: 'PAID', // для наличных сразу оплачен
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.name,
              productPrice: item.price,
              quantity: item.quantity
            }))
          }
        }
      })
      
      // 3. Уменьшаем stock для каждого товара
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }
      
      // 4. Очищаем корзину пользователя
      if (session?.user?.id) {
        await tx.cart.deleteMany({
          where: { userId: session.user.id }
        })
      }
      
      return order
    })
    
    return NextResponse.json({ 
      success: true,
      orderId: result.id 
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Ошибка создания заказа (наличные):', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при оформлении заказа' },
      { status: 500 }
    )
  }
}