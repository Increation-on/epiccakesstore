'use client'

import React, { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const PaymentForm = React.memo(({ amount, orderId }: { 
  amount: number; 
  orderId: string; 
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements || !confirmed) return
    
    setProcessing(true)
    setError(null)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/${orderId}/success`,
      },
    })

    if (submitError) {
      setError(submitError.message || 'Ошибка при оплате')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="w-5 h-5 accent-purple-600 cursor-pointer"
        />
        <span className="text-sm text-gray-700">
          Я подтверждаю, что данные карты введены корректно и хочу оплатить
        </span>
      </label>
      
      <button
        type="submit"
        disabled={!stripe || !confirmed || processing}
        className={`w-full py-3 rounded-lg transition-all duration-200 ${
          !confirmed 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.98]'
        }`}
      >
        {processing ? 'Обработка...' : `Оплатить ${amount} ₽`}
      </button>
    </form>
  )
})

PaymentForm.displayName = 'PaymentForm'

export const StripePayment = React.memo(({ amount, clientSecret, orderId }: { 
  amount: number; 
  clientSecret: string; 
  orderId: string;
}) => {
  const options = {
    clientSecret,
    loader: 'always' as const,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#10b981',
      }
    }
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm amount={amount} orderId={orderId} />
    </Elements>
  )
})

StripePayment.displayName = 'StripePayment'