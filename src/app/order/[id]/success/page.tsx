'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function OrderSuccessPage() {
  const params = useParams()
  const orderId = params.id as string
  const [mounted, setMounted] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('pending')

useEffect(() => {
  console.log('🔥 orderId из params:', orderId)
  console.log('🔥 window.location:', window.location.href)
  
  setMounted(true)
  
  const query = new URLSearchParams(window.location.search)
  const paymentIntent = query.get('payment_intent')
  
  if (paymentIntent) {
    console.log('🔥 paymentIntent найден:', paymentIntent)
    setPaymentStatus('paid')
    
    // Добавим проверку перед fetch
    if (!orderId) {
      console.error('❌ orderId отсутствует! Невозможно обновить статус')
      return
    }
    
    fetch(`/api/orders/${orderId}/paid`, { 
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => console.log('✅ Ответ от сервера:', data))
      .catch(console.error)
  }
}, [orderId])

  if (!mounted) return null

  return (
    <div className="container mx-auto p-4 max-w-2xl text-center">
      <div className="bg-green-50 border border-green-200 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          {paymentStatus === 'paid' ? '✅ Оплачено!' : '🎉 Заказ оформлен!'}
        </h1>
        
        <p className="text-xl mb-2">
          Номер вашего заказа:
        </p>
        <p className="text-2xl font-mono bg-white p-3 rounded border border-green-200 inline-block mb-6">
          {orderId}
        </p>
        
        <p className="text-gray-600 mb-6">
          {paymentStatus === 'paid' 
            ? 'Спасибо за оплату! Мы уже начали готовить ваш заказ.' 
            : 'Мы отправили подтверждение на ваш email. Скоро с вами свяжется менеджер для уточнения деталей.'}
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            На главную
          </Link>
          
          <Link
            href="/products"
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            В каталог
          </Link>
        </div>
      </div>
    </div>
  )
}