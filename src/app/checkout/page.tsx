import { Suspense } from 'react'
import CheckoutContent from './CheckoutContent'
import CheckoutSkeleton from '@/components/features/skeleton/CheckoutSkeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Оформление заказа | EpicCakesStore',
  description: 'Заполните форму для оформления заказа.',
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  )
}