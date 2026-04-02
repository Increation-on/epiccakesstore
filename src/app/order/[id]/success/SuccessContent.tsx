//app/order/[id]/success/SuccessContent.tsx
'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cart.store'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'

export default function SuccessContent() {
  const params = useParams()
  const orderId = params.id as string
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'error'>('pending')
  const [loading, setLoading] = useState(true)
  const clearCart = useCartStore(state => state.clearCart)

  useEffect(() => {
    async function confirmOrder() {
      console.log('🟢 [Success] Страница успеха, orderId:', orderId)
      
      // Устанавливаем флаг, что оплата обрабатывается
      sessionStorage.setItem('processing_payment', 'true')
      
      const query = new URLSearchParams(window.location.search)
      const paymentIntent = query.get('payment_intent')
      const redirectStatus = query.get('redirect_status')
      
      console.log('🟢 [Success] paymentIntent:', paymentIntent)
      console.log('🟢 [Success] redirect_status:', redirectStatus)
      
      if (paymentIntent) {
        // Оплата картой
        try {
          console.log('🟢 [Success] Вызываем API для обновления статуса...')
          const res = await fetch(`/api/orders/${orderId}/paid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
          
          const data = await res.json()
          console.log('🟢 [Success] Ответ API:', { status: res.status, data })
          
          if (res.ok) {
            console.log('🟢 [Success] Статус успешно обновлен на PAID')
            
            // ТОЛЬКО ПОСЛЕ УСПЕШНОГО API очищаем корзину
            console.log('🟢 [Success] Очищаем корзину')
            clearCart()
            localStorage.removeItem('cart-storage')
            
            // Очищаем корзину на сервере
            await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: [] })
            })
            
            setPaymentStatus('paid')
            toast.success('Оплата прошла успешно!')
          } else {
            console.error('🔴 [Success] Ошибка API:', data.error)
            setPaymentStatus('error')
            toast.error(data.error || 'Ошибка при подтверждении оплаты')
          }
        } catch (error) {
          console.error('🔴 [Success] Исключение:', error)
          setPaymentStatus('error')
          toast.error('Ошибка при подтверждении оплаты')
        } finally {
          // Убираем флаг и очищаем временные данные
          sessionStorage.removeItem('processing_payment')
          sessionStorage.removeItem('checkoutFormData')
          sessionStorage.removeItem('paymentState')
          setLoading(false)
        }
      } else {
        // Оплата наличными
        console.log('🟢 [Success] Оплата наличными, очищаем корзину')
        
        try {
          // Очищаем корзину
          clearCart()
          localStorage.removeItem('cart-storage')
          
          // Очищаем корзину на сервере
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [] })
          })
          
          setPaymentStatus('pending')
        } catch (error) {
          console.error('🔴 [Success] Ошибка при очистке корзины:', error)
          setPaymentStatus('pending')
        } finally {
          sessionStorage.removeItem('checkoutFormData')
          sessionStorage.removeItem('paymentState')
          sessionStorage.removeItem('processing_payment')
          setLoading(false)
        }
      }
    }
    
    confirmOrder()
  }, [orderId, clearCart])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-2xl text-center">
        <div className="rounded-lg p-6 md:p-8 bg-(--mint) border border-(--mint-dark)">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Подтверждение заказа...</h1>
          <p className="text-base md:text-xl text-(--text-muted)">Пожалуйста, подождите</p>
          <div className="mt-4 animate-spin text-4xl">⏳</div>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'error') {
    return (
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-2xl text-center">
        <div className="rounded-lg p-6 md:p-8 bg-red-50 border border-red-200">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-red-700">❌ Ошибка оплаты</h1>
          <p className="text-base md:text-xl mb-4 text-red-600">
            Не удалось подтвердить оплату
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Пожалуйста, свяжитесь с поддержкой и сообщите номер заказа: {orderId}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/profile/orders">
              <Button size="lg" className="w-full sm:w-auto">Мои заказы</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">На главную</Button>
            </Link>
          </div>
        </div>
      </div>
    )
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
            <Button size="lg" className="w-full sm:w-auto">На главную</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">В каталог</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}