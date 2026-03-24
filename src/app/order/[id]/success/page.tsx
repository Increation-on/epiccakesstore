'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cart.store'
import { Button } from '@/components/ui/Button'
import OrderSuccessSkeleton from '@/components/features/skeleton/OrderSuccessSkeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Заказ оформлен | EpicCakesStore',
  description: 'Спасибо за заказ! Мы свяжемся с вами для подтверждения.',
}

export default function OrderSuccessPage() {
  const params = useParams()
  const orderId = params.id as string
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('pending')
  const clearCart = useCartStore(state => state.clearCart)

  useEffect(() => {
    console.log('🔥 orderId из params:', orderId)
    console.log('🔥 window.location:', window.location.href)
    
    setMounted(true)
    
    // 🔥 Очищаем sessionStorage
    sessionStorage.removeItem('checkoutFormData')
    sessionStorage.removeItem('paymentState')
    console.log('🧹 sessionStorage очищен')
    
    // 🔥 Очищаем корзину
    clearCart()
    localStorage.removeItem('cart-storage')
    console.log('🧹 корзина очищена')
    
    const query = new URLSearchParams(window.location.search)
    const paymentIntent = query.get('payment_intent')
    
    if (paymentIntent) {
      console.log('🔥 paymentIntent найден:', paymentIntent)
      setPaymentStatus('paid')
      
      if (!orderId) {
        console.error('❌ orderId отсутствует! Невозможно обновить статус')
        setLoading(false)
        return
      }
      
      fetch(`/api/orders/${orderId}/paid`, { 
        method: 'POST'
      })
        .then(res => res.json())
        .then(data => console.log('✅ Ответ от сервера:', data))
        .catch(console.error)
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [orderId, clearCart])

  if (!mounted || loading) {
    return <OrderSuccessSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-2xl text-center">
      <div className={`rounded-lg p-6 md:p-8 ${
        paymentStatus === 'paid' 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-(--mint) border border-(--mint-dark)'
      }`}>
        <h1 className={`text-2xl md:text-3xl font-bold mb-4 ${
          paymentStatus === 'paid' ? 'text-green-700' : 'text-(--text)'
        }`}>
          {paymentStatus === 'paid' ? '✅ Оплачено!' : '🎉 Заказ оформлен!'}
        </h1>
        
        <p className="text-base md:text-xl mb-2 text-(--text-muted)">
          Номер вашего заказа:
        </p>
        <p className="text-xl md:text-2xl font-mono bg-white p-3 rounded-lg border border-(--border) inline-block mb-6 break-all">
          {orderId}
        </p>
        
        <p className="text-sm md:text-base text-(--text-muted) mb-6 max-w-md mx-auto">
          {paymentStatus === 'paid' 
            ? 'Спасибо за оплату! Мы уже начали готовить ваш заказ.' 
            : 'Мы отправили подтверждение на ваш email. Скоро с вами свяжется менеджер для уточнения деталей.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              На главную
            </Button>
          </Link>
          
          <Link href="/products">
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-(--mint-dark)">
              В каталог
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}