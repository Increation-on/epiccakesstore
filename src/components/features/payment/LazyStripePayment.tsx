'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Динамический импорт с отключенным SSR
const StripePayment = dynamic(
  () => import('./StripePayment').then(mod => mod.StripePayment),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 animate-pulse bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-400">Загрузка платежной формы...</div>
      </div>
    ),
  }
)

export function LazyStripePayment(props: {
  amount: number
  clientSecret: string
  onSuccess: () => void
  orderId: string
}) {
  return (
    <Suspense fallback={
      <div className="h-48 animate-pulse bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-400">Загрузка платежной формы...</div>
      </div>
    }>
      <StripePayment {...props} />
    </Suspense>
  )
}