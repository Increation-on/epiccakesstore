// app/profile/orders/[id]/RepeatOrderButton.tsx
'use client'

import { useCartStore } from "@/store/cart.store"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function RepeatOrderButton({ items }: { items: { productId: string, quantity: number }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { setItems, items: currentItems } = useCartStore()

  const handleRepeatOrder = async () => {
    setLoading(true)
    
    // ВАЖНО: Очищаем сохраненные данные формы перед повторным заказом
    sessionStorage.removeItem('checkoutFormData')
    sessionStorage.removeItem('paymentState')
    
    // Преобразуем товары в формат корзины
    const newItems = items.map(item => ({
      id: crypto.randomUUID(),
      productId: item.productId,
      quantity: item.quantity,
      addedAt: new Date().toISOString()
    }))

    // Объединяем с текущими товарами в корзине
    const mergedItems = [...currentItems]
    
    newItems.forEach((newItem) => {
      const existingItemIndex = mergedItems.findIndex(
        item => item.productId === newItem.productId
      )
      
      if (existingItemIndex !== -1) {
        mergedItems[existingItemIndex].quantity += newItem.quantity
      } else {
        mergedItems.push(newItem)
      }
    })

    setItems(mergedItems)
    
    setTimeout(() => {
      router.push('/cart') // сначала в корзину
    }, 500)
  }

  return (
    <button
      onClick={handleRepeatOrder}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
    >
      {loading ? 'Добавляем...' : '🔄 Повторить заказ'}
    </button>
  )
}