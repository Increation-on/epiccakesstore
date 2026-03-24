// app/admin/orders/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Order } from '@/types/domain/order.types'
import { Button } from '@/components/ui/Button'

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

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  const loadOrders = async () => {
    try {
      const url = statusFilter === 'all' 
        ? '/api/admin/orders'
        : `/api/admin/orders?status=${statusFilter}`
      
      const res = await fetch(url)
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/')
    }
  }, [session, status, router])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentMethodLabel = (method: string) => {
    return method === 'card' ? '💳 Карта' : '💰 Наличные'
  }

  if (status === 'loading' || loading) {
    return <div className="p-4 md:p-6">Загрузка...</div>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Управление заказами</h1>
        
        {/* Фильтр по статусу */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-(--border) rounded-lg p-2 text-sm md:text-base bg-white text-(--text) focus:ring-2 focus:ring-(--pink) focus:border-(--pink)"
        >
          <option value="all">Все статусы</option>
          {Object.keys(statusLabels).map(key => (
            <option key={key} value={key}>
              {statusLabels[key as keyof typeof statusLabels]}
            </option>
          ))}
        </select>
      </div>

      {/* Таблица — только на десктопе */}
      <div className="hidden md:block bg-white rounded shadow overflow-x-auto">
        <div className="min-w-250">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID заказа</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Покупатель</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Контакты</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товаров</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Оплата</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={String(order.id)} className="hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-4 font-mono text-sm">#{String(order.id).slice(-8)}</td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="font-medium">{order.fullName}</div>
                    {order.user?.name && (
                      <div className="text-sm text-gray-500">{order.user.name}</div>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-sm">{order.email}</div>
                    <div className="text-sm text-gray-500">{order.phone}</div>
                  </td>
                  <td className="px-4 md:px-6 py-4">{order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td className="px-4 md:px-6 py-4 font-medium">{order.total} ₽</td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${statusColors[order.status as keyof typeof statusColors]}`}>
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm">{getPaymentMethodLabel(order.paymentMethod)}</td>
                  <td className="px-4 md:px-6 py-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                  <td className="px-4 md:px-6 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      Детали
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Карточки — только на мобилке */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <div key={String(order.id)} className="bg-white rounded shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-sm text-gray-500">#{String(order.id).slice(-8)}</span>
              <span className={`px-2 py-0.5 text-xs rounded ${statusColors[order.status as keyof typeof statusColors]}`}>
                {statusLabels[order.status as keyof typeof statusLabels]}
              </span>
            </div>
            
            <div className="border-t border-gray-100 pt-2 mt-2">
              <div className="font-medium">{order.fullName}</div>
              <div className="text-sm text-gray-500">{order.email}</div>
              <div className="text-sm text-gray-500">{order.phone}</div>
            </div>
            
            <div className="flex justify-between mt-3">
              <div>
                <div className="text-xs text-gray-500">Товаров</div>
                <div className="font-medium">{order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Сумма</div>
                <div className="font-bold text-(--pink)">{order.total} ₽</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Дата</div>
                <div className="text-sm">{formatDate(order.createdAt)}</div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => router.push(`/admin/orders/${order.id}`)}
            >
              Подробнее →
            </Button>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 text-(--text-muted)">
          Заказы не найдены
        </div>
      )}
    </div>
  )
}