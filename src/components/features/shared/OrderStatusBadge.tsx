// components/OrderStatusBadge.tsx
const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Ожидает' },
  PENDING_PAYMENT: { color: 'bg-blue-100 text-blue-800', label: 'Ожидает оплаты' },
  PAID: { color: 'bg-green-100 text-green-800', label: 'Оплачен' },
  PROCESSING: { color: 'bg-purple-100 text-purple-800', label: 'В обработке' },
  SHIPPED: { color: 'bg-indigo-100 text-indigo-800', label: 'Отправлен' },
  DELIVERED: { color: 'bg-green-100 text-green-800', label: 'Доставлен' },
  CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Отменён' }
}

export function OrderStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: 'bg-gray-100 text-gray-800',
    label: status
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}