'use client'

import { Price } from '@/components/ui/Price'

export const OrderSummary = ({ cartItems, products, totalPrice, isLoading }: any) => {
  // Если данные еще загружаются или нет товаров, показываем скелетон
  if (isLoading || cartItems.length === 0 || products.length === 0) {
    return (
      <div className="mb-6 border rounded-lg p-4 bg-gray-50">
        <h2 className="font-semibold mb-3">Состав заказа</h2>
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex justify-between mt-2 pt-2 border-t">
          <span>Итого:</span>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 border rounded-lg p-4 bg-gray-50">
      <h2 className="font-semibold mb-3">Состав заказа</h2>
      {cartItems.map((item: any) => {
        const product = products.find((p: any) => p.id === item.productId)
        return (
          <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
            <span>{product?.name} x{item.quantity}</span>
            <Price price={product?.price || 0} />
          </div>
        )
      })}
      <div className="flex justify-between font-bold mt-2 pt-2 border-t">
        <span>Итого:</span>
        <Price price={totalPrice} />
      </div>
    </div>
  )
}