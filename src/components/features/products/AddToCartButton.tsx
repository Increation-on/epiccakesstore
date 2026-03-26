'use client'

import { useCartStore } from '@/store/cart.store'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'

interface Props {
  productId: string
  inStock: boolean
}

export function AddToCartButton({ productId, inStock }: Props) {
  const addItem = useCartStore(state => state.addItem)

  const handleClick = () => {
    
    try {
    addItem(productId, 1)
    toast.success('Товар добавлен в корзину');
  } catch (error) {
    toast.error('Не удалось добавить товар');
  }
  }

  return (
    <Button
      size="lg"
      disabled={!inStock}
      onClick={handleClick}
      className="w-full md:w-auto"
    >
      {inStock ? 'Добавить в корзину' : 'Нет в наличии'}
    </Button>
  )
}