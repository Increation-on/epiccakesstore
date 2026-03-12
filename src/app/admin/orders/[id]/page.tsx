// app/admin/orders/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Order } from '@/types/domain/order.types'

const statusColors = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const statusLabels = {
  PENDING_PAYMENT: 'Ожидает оплаты',
  PAID: 'Оплачен',
  PROCESSING: 'В обработке',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён'
}

export default function OrderDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const orderId = String(params.id)
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`)
        if (!res.ok) {
          router.push('/admin/orders')
          return
        }
        const data = await res.json()
        setOrder(data)
      } catch (error) {
        console.error('Error loading order:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      loadOrder()
    }
  }, [orderId, router])

// app/admin/orders/[id]/page.tsx

const handleStatusChange = async (newStatus: string) => {
  if (!order) return
  
  // Если статус не изменился — ничего не делаем
  if (newStatus === order.status) return
  
  // Спрашиваем подтверждение
  const confirmMessage = `Изменить статус заказа с "${statusLabels[order.status as keyof typeof statusLabels]}" на "${statusLabels[newStatus as keyof typeof statusLabels]}"?`
  
  if (!confirm(confirmMessage)) return
  
  setUpdating(true)
  try {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })

    if (res.ok) {
      setOrder({ ...order, status: newStatus })
    } else {
      alert('Ошибка при обновлении статуса')
    }
  } catch (error) {
    console.error('Error updating status:', error)
    alert('Ошибка при обновлении статуса')
  } finally {
    setUpdating(false)
  }
}

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === 'loading' || loading) {
    return <div className="p-6">Загрузка...</div>
  }

  if (!order) {
    return <div className="p-6">Заказ не найден</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/orders')}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          ← Назад к списку
        </button>
      </div>

      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Заказ #{String(order.id).slice(-8)}
            </h1>
            <p className="text-gray-600 mt-1">
              от {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-sm rounded ${
              statusColors[order.status as keyof typeof statusColors]
            }`}>
              {statusLabels[order.status as keyof typeof statusLabels]}
            </span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="border rounded p-2 text-sm"
            >
              {Object.keys(statusLabels).map(key => (
                <option key={key} value={key}>
                  {statusLabels[key as keyof typeof statusLabels]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Информация о покупателе */}
        <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded">
          <div>
            <h2 className="font-semibold mb-2">Покупатель</h2>
            <p><span className="text-gray-600">Имя:</span> {order.fullName}</p>
            <p><span className="text-gray-600">Email:</span> {order.email}</p>
            <p><span className="text-gray-600">Телефон:</span> {order.phone}</p>
            {order.user && (
              <p className="text-sm text-gray-500 mt-2">
                Зарегистрированный пользователь: {order.user.name || order.user.email}
              </p>
            )}
          </div>
          <div>
            <h2 className="font-semibold mb-2">Доставка и оплата</h2>
            <p><span className="text-gray-600">Адрес:</span> {order.address}</p>
            <p><span className="text-gray-600">Способ оплаты:</span> {
              order.paymentMethod === 'card' ? '💳 Карта' : '💰 Наличные'
            }</p>
            <p className="text-lg font-bold mt-2">
              Итого: {order.total} ₽
            </p>
          </div>
        </div>

        {/* Состав заказа */}
        <div>
          <h2 className="font-semibold mb-4">Состав заказа</h2>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Товар</th>
                <th className="px-4 py-2 text-left">Цена</th>
                <th className="px-4 py-2 text-left">Количество</th>
                <th className="px-4 py-2 text-left">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.orderItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">
                    <div>{item.productName}</div>
                    {item.product && (
                      <div className="text-sm text-gray-500">
                        ID: {String(item.product.id)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2">{item.productPrice} ₽</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2 font-medium">
                    {item.productPrice * item.quantity} ₽
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td colSpan={3} className="px-4 py-2 text-right">Итого:</td>
                <td className="px-4 py-2">{order.total} ₽</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}