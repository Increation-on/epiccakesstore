import { Suspense } from 'react'
import CartContent from './CartContent'
import CartSkeleton from '@/components/features/skeleton/CartSkeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Корзина | EpicCakesStore',
  description: 'Оформите заказ. Просмотрите выбранные товары.',
}

export default function CartPage() {
  return (
    <Suspense fallback={<CartSkeleton />}>
      <CartContent />
    </Suspense>
  )
}