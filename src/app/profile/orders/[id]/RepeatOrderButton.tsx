'use client'

import { useCartStore } from "@/store/cart.store"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { toast } from "@/lib/toast"

export function RepeatOrderButton({ items }: { items: { productId: string, quantity: number }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { setItems, items: currentItems } = useCartStore()

  const handleRepeatOrder = async () => {
    setLoading(true)
    
    sessionStorage.removeItem('checkoutFormData')
    sessionStorage.removeItem('paymentState')
    
    const newItems = items.map(item => ({
      id: crypto.randomUUID(),
      productId: item.productId,
      quantity: item.quantity,
      addedAt: new Date().toISOString()
    }))

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
    toast.success('Товары добавлены в корзину')
    
    setTimeout(() => {
      router.push('/cart')
    }, 500)
  }

  return (
    <Button
      onClick={handleRepeatOrder}
      disabled={loading}
      className="w-full"
    >
      {loading ? 'Добавляем...' : '🔄 Повторить заказ'}
    </Button>
  )
}