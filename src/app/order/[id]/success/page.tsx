import { Suspense } from 'react'
import OrderSuccessSkeleton from '@/components/features/skeleton/OrderSuccessSkeleton'
import type { Metadata } from 'next'
import SuccessContent from './SuccessContent'

export const metadata: Metadata = {
  title: 'Заказ оформлен | EpicCakesStore',
  description: 'Спасибо за заказ! Мы свяжемся с вами для подтверждения.',
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessSkeleton />}>
      <SuccessContent />
    </Suspense>
  )
}