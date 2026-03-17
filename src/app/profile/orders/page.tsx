// app/profile/orders/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { OrderStatusBadge } from "@/components/features/shared/OrderStatusBadge"

// Функция для форматирования даты
function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default async function ProfileOrdersPage() {
  const session = await getServerSession(authOptions)
  
  // Получаем заказы текущего пользователя
  const orders = await prisma.order.findMany({
    where: {
      userId: session?.user?.id
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc' // сначала новые
    }
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Мои заказы</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">У вас пока нет заказов</p>
          <Link 
            href="/catalog" 
            className="text-blue-600 hover:underline"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link 
              key={order.id} 
              href={`/profile/orders/${order.id}`}
              className="block border rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                {/* Левая часть - информация о заказе */}
                <div>
                  <p className="font-semibold text-lg">
                    Заказ №{order.id.slice(-8)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.orderItems.length} товар(ов)
                  </p>
                </div>
                
                {/* Правая часть - статус и сумма */}
                <div className="text-right">
                  <OrderStatusBadge status={order.status} />
                  <p className="font-bold text-lg mt-2">
                    {order.total} ₽
                  </p>
                </div>
              </div>
              
              {/* Превью товаров (первые 3) */}
              {order.orderItems.length > 0 && (
                <div className="mt-3 flex gap-2 text-sm text-gray-500">
                  {order.orderItems.slice(0, 3).map((item) => (
                    <span key={item.id} className="truncate max-w-37.5">
                      {item.product?.name} x{item.quantity}
                    </span>
                  ))}
                  {order.orderItems.length > 3 && (
                    <span>и ещё {order.orderItems.length - 3}</span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}