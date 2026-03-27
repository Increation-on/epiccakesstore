// app/admin/orders/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Order } from '@/types/domain/order.types'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'
import { Modal } from '@/components/ui/Modal'

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
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)

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

  const handleStatusChangeClick = (newStatus: string) => {
    if (!order) return
    if (newStatus === order.status) return
    setPendingStatus(newStatus)
    setShowStatusModal(true)
  }

  const confirmStatusChange = async () => {
    if (!order || !pendingStatus) return

    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: pendingStatus })
      })

      if (res.ok) {
        setOrder({ ...order, status: pendingStatus })
        toast.success(`Статус изменен на "${statusLabels[pendingStatus as keyof typeof statusLabels]}"`)
      } else {
        toast.error('Ошибка при обновлении статуса')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Ошибка при обновлении статуса')
    } finally {
      setUpdating(false)
      setShowStatusModal(false)
      setPendingStatus(null)
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
    return <div className="p-4 md:p-6">Загрузка...</div>
  }

  if (!order) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Заказ не найден
        </div>
        <Button onClick={() => router.push('/admin/orders')} className="mt-4">
          ← Вернуться к списку
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Кнопка назад */}
      <div className="mb-4 md:mb-6">
        <button
          onClick={() => router.push('/admin/orders')}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm md:text-base"
        >
          ← Назад к списку
        </button>
      </div>

      <div className="bg-white rounded shadow p-4 md:p-6">
        {/* Заголовок и статус */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold wrap-break-word">
              Заказ #{String(order.id).slice(-8)}
            </h1>
            <p className="text-(--text-muted) mt-1 text-sm">
              от {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-2">
            <span className={`px-3 py-1 text-sm rounded whitespace-nowrap ${statusColors[order.status as keyof typeof statusColors]}`}>
              {statusLabels[order.status as keyof typeof statusLabels]}
            </span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChangeClick(e.target.value)}
              disabled={updating}
              className="border border-(--border) rounded-lg p-2 text-sm bg-white text-(--text) focus:ring-2 focus:ring-(--pink) focus:border-(--pink) w-full sm:w-auto"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-(--bg) rounded-lg border border-(--border)">
          <div>
            <h2 className="font-semibold mb-2 text-(--text)">Покупатель</h2>
            <div className="space-y-1 text-sm">
              <p><span className="text-(--text-muted)">Имя:</span> {order.fullName}</p>
              <p><span className="text-(--text-muted)">Email:</span> <span className="wrap-break-word">{order.email}</span></p>
              <p><span className="text-(--text-muted)">Телефон:</span> {order.phone}</p>
              {order.user && (
                <p className="text-xs text-(--text-muted) mt-2 wrap-break-word">
                  Зарегистрированный пользователь: {order.user.name || order.user.email}
                </p>
              )}
            </div>
          </div>
          <div>
            <h2 className="font-semibold mb-2 text-(--text)">Доставка и оплата</h2>
            <div className="space-y-1 text-sm">
              <p><span className="text-(--text-muted)">Адрес:</span> <span className="wrap-break-word">{order.address}</span></p>
              <p><span className="text-(--text-muted)">Способ оплаты:</span> {
                order.paymentMethod === 'card' ? '💳 Карта' : '💰 Наличные'
              }</p>
              <p className="text-lg font-bold mt-2 text-(--pink) wrap-break-word">
                Итого: {order.total} ₽
              </p>
            </div>
          </div>
        </div>

        {/* Состав заказа */}
        <div>
          <h2 className="font-semibold mb-4 text-(--text)">Состав заказа</h2>

          {/* Таблица — только на десктопе */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-125">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Кол-во</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.orderItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-sm">
                        <div className="font-medium wrap-break-word">{item.productName}</div>
                        {item.product && (
                          <div className="text-xs text-(--text-muted)">ID: {String(item.product.id)}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm whitespace-nowrap">{item.productPrice} ₽</td>
                      <td className="px-3 py-2 text-sm">{item.quantity}</td>
                      <td className="px-3 py-2 text-sm font-medium whitespace-nowrap">{item.productPrice * item.quantity} ₽</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="font-bold">
                    <td colSpan={3} className="px-3 py-2 text-right">Итого:</td>
                    <td className="px-3 py-2">{order.total} ₽</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Карточки — только на мобилке */}
          <div className="md:hidden space-y-3">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="border border-(--border) rounded-lg p-3">
                <div className="font-medium text-(--text) wrap-break-word mb-1">
                  {item.productName}
                </div>
                {item.product && (
                  <div className="text-xs text-(--text-muted) mb-2">
                    ID: {String(item.product.id)}
                  </div>
                )}
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <span className="text-xs text-(--text-muted)">Цена</span>
                    <div className="font-medium">{item.productPrice} ₽</div>
                  </div>
                  <div>
                    <span className="text-xs text-(--text-muted)">Кол-во</span>
                    <div className="font-medium">{item.quantity}</div>
                  </div>
                  <div>
                    <span className="text-xs text-(--text-muted)">Сумма</span>
                    <div className="font-medium text-(--pink)">{item.productPrice * item.quantity} ₽</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t border-(--border) pt-3 mt-3 text-right">
              <span className="text-(--text-muted) text-sm">Итого: </span>
              <span className="text-xl font-bold text-(--pink)">{order.total} ₽</span>
            </div>
          </div>
        </div>
      </div>

      {/* Модалка подтверждения смены статуса */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false)
          setPendingStatus(null)
        }}
        title="Изменение статуса заказа"
      >
        <p className="text-(--text-muted) mb-6">
          Вы уверены, что хотите изменить статус заказа с<br />
          <span className="font-semibold">"{statusLabels[order?.status as keyof typeof statusLabels]}"</span><br />
          на<br />
          <span className="font-semibold">"{pendingStatus ? statusLabels[pendingStatus as keyof typeof statusLabels] : ''}"</span>?
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setShowStatusModal(false)
              setPendingStatus(null)
            }}
          >
            Отмена
          </Button>
          <Button onClick={confirmStatusChange} className="bg-(--pink) hover:bg-(--pink-dark)">
            Подтвердить
          </Button>
        </div>
      </Modal>
    </div>
  )
}