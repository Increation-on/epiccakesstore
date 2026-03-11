'use client'

import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// 👇 добавляем orderId в пропсы
function PaymentForm({ amount, onSuccess, orderId }: { 
  amount: number; 
  onSuccess: () => void;
  orderId: string; 
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) return
    
    setProcessing(true)
    setError(null)
    console.log('🟡 orderId перед оплатой:', orderId)
  console.log('🟡 return_url:', `${window.location.origin}/order/${orderId}/success`)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // 👇 используем orderId из пропсов
        return_url: `${window.location.origin}/order/${orderId}/success`,
      },
    })

    if (submitError) {
      setError(submitError.message || 'Ошибка при оплате')
      setProcessing(false)
    } else {
      onSuccess()
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
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
      >
        {processing ? 'Обработка...' : `Оплатить ${amount} ₽`}
      </button>
    </form>
  )
}

// 👇 и здесь добавляем orderId в пропсы
export function StripePayment({ amount, clientSecret, onSuccess, orderId }: { 
  amount: number; 
  clientSecret: string; 
  onSuccess: () => void;
  orderId: string;  // добавили
}) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#10b981',
      }
    }
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm amount={amount} onSuccess={onSuccess} orderId={orderId} />
    </Elements>
  )
}