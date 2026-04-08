'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { type Currency } from '@/lib/currency'  // ← импорт типа

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
  amount: number           // сумма в BYN для Stripe
  displayAmount: number    // сумма для отображения в выбранной валюте
  displayCurrency: Currency  // ← меняем string на Currency
  clientSecret: string
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