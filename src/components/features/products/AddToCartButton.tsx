'use client'

import { useCartStore } from '@/store/cart.store'
import { Button } from '@/components/ui/Button'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { toast } from '@/lib/toast'

interface Props {
  productId: string
  stock: number 
}

export function AddToCartButton({ productId, stock }: Props) {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const addItem = useCartStore(state => state.addItem)
  
  const isOutOfStock = stock === 0

const handleClick = () => {
  if (isOutOfStock) return;
  
  try {
    addItem(productId, 1);
    toast.success('Товар добавлен в корзину');
  } catch (error) {
    console.error('Ошибка при добавлении:', error);
    toast.error('Не удалось добавить товар');
  }
}

  // Если не авторизован — показываем кнопку "Войдите, чтобы купить"
  if (!isAuthenticated) {
    return (
      <Link href="/login" className="block w-full md:w-auto">
        <Button size="lg" className="w-full md:w-auto" variant="outline">
          Войдите, чтобы купить
        </Button>
      </Link>
    )
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