'use client'

import { useCartStore } from '@/store/cart.store'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'

interface Props {
  productId: string
  stock: number 
}

export function AddToCartButton({ productId, stock }: Props) {
  const addItem = useCartStore(state => state.addItem)
  
  const isOutOfStock = stock === 0

  const handleClick = () => {
    if (isOutOfStock) return
    
    try {
      addItem(productId, 1)
      toast.success('Товар добавлен в корзину')
    } catch (error) {
      toast.error('Не удалось добавить товар')
    }
  }

  return (
    <Button
      size="lg"
      disabled={isOutOfStock}
      onClick={handleClick}
      className="w-full md:w-auto text-white"
    >
      {isOutOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
    </Button>
  )
}