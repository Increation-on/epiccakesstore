'use client'

export const dynamic = 'force-dynamic'

import { useCartStore } from '@/store/cart.store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Product } from '@/types/domain/product.types'
import Link from 'next/link'
import { LazyStripePayment } from '@/components/features/payment/LazyStripePayment'
import { useSession } from 'next-auth/react'
import { toast } from '@/lib/toast'
import { ConfirmPageSkeleton } from '@/components/features/skeleton/ConfirmPageSkeleton'
import { useCurrencyStore } from '@/store/currency.store'
import { OrderSummary } from './_components/orderSummary'
import FullscreenLoader from '@/components/ui/FullscreenLoader'
import { convertPrice, type Currency } from '@/lib/currency'

export default function ConfirmPage() {

  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, setItems, clearCart } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingFormData, setLoadingFormData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [cartLoaded, setCartLoaded] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  const currency = useCurrencyStore((state) => state.currency)
  const cartItems = Array.isArray(items) ? items : []

  // Перенос корзины после входа/регистрации
  useEffect(() => {
    const transferCart = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const shouldTransfer = urlParams.get('cartTransfer') === 'true'

      if (session && shouldTransfer && status === 'authenticated') {
        const savedCart = localStorage.getItem('cart-storage')
        if (savedCart) {
          const guestCart = JSON.parse(savedCart)
          const items = guestCart.state?.items || []

          if (items.length > 0) {
            const userCartRes = await fetch('/api/cart')
            const userCart = await userCartRes.json()
            const mergedItems = [...userCart]

            items.forEach((guestItem: any) => {
              const existing = mergedItems.find(
                (item: any) => item.productId === guestItem.productId
              )

              if (existing) {
                existing.quantity += guestItem.quantity
              } else {
                mergedItems.push({
                  id: crypto.randomUUID(),
                  productId: guestItem.productId,
                  quantity: guestItem.quantity,
                  addedAt: new Date().toISOString()
                })
              }
            })

            await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: mergedItems })
            })

            setItems(mergedItems)
          }
        }

        const url = new URL(window.location.href)
        url.searchParams.delete('cartTransfer')
        window.history.replaceState({}, '', url.toString())
      }
    }

    transferCart()
  }, [session, status, setItems])

  // Восстанавливаем состояние оплаты
  useEffect(() => {
    const savedPaymentState = sessionStorage.getItem('paymentState')
    
    if (savedPaymentState) {
      const { showPayment, clientSecret, orderId, timestamp } = JSON.parse(savedPaymentState)
      
      if (timestamp && Date.now() - timestamp < 5 * 60 * 1000) {
        fetch(`/api/orders/${orderId}`)
          .then(res => res.json())
          .then(order => {
            if (order.status === 'PAID' || order.status === 'DELIVERED') {
              sessionStorage.removeItem('paymentState')
              setShowPayment(false)
              setClientSecret(null)
              setOrderId(null)
            } else {
              setShowPayment(showPayment)
              setClientSecret(clientSecret)
              setOrderId(orderId)
            }
          })
          .catch(() => {
            sessionStorage.removeItem('paymentState')
            setShowPayment(false)
            setClientSecret(null)
            setOrderId(null)
          })
      } else {
        sessionStorage.removeItem('paymentState')
      }
    }
  }, [])

  // Сохраняем состояние оплаты
  useEffect(() => {
    if (showPayment && clientSecret && orderId) {
      sessionStorage.setItem('paymentState', JSON.stringify({
        showPayment,
        clientSecret,
        orderId,
        timestamp: Date.now()
      }))
    } else {
      sessionStorage.removeItem('paymentState')
    }
  }, [showPayment, clientSecret, orderId])

  // Следим за загрузкой корзины
  useEffect(() => {
    if (items) setCartLoaded(true)
  }, [items])

  // Загрузка товаров и данных формы
  useEffect(() => {
    async function loadProducts() {
      if (cartItems.length === 0) {   
        setProducts([])
        setLoading(false)
        return
      }

      const productIds = cartItems.map(item => item.productId)

      try {
        const res = await fetch('/api/products/by-ids', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: productIds })
        })
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    const savedData = sessionStorage.getItem('checkoutFormData')
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
      } catch (error) {
        console.error('Ошибка парсинга formData:', error)
        router.push('/checkout')
      }
    } else {
      router.push('/checkout')
    }
    
    setLoadingFormData(false)
    loadProducts()
  }, [cartItems.length, router])

  const totalPrice = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)
    return sum + (product?.price || 0) * (item?.quantity || 0)
  }, 0)

  const displayAmount = convertPrice(totalPrice, currency)

  const handleConfirm = async () => {
    setSubmitting(true)
    setIsRedirecting(true)

    const orderData = {
      formData: formData,
      items: cartItems.map(item => {
        const product = products.find(p => p.id === item.productId)
        return {
          productId: item.productId,
          name: product?.name,
          quantity: item.quantity,
          price: product?.price
        }
      }),
      total: totalPrice
    }

    try {
      const res = await fetch('/api/orders/cash/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const result = await res.json()

      if (res.ok) {
        clearCart()
        sessionStorage.removeItem('checkoutFormData')
        sessionStorage.removeItem('paymentState')
        
        setTimeout(() => {
          window.location.href = `/order/${result.orderId}/success`
        }, 500)
      } else {
        toast.error(result.error || 'Ошибка при оформлении заказа')
        setIsRedirecting(false)
      }
    } catch (error) {
      console.error('Ошибка:', error)
      toast.error('Ошибка при отправке заказа')
      setIsRedirecting(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartPayment = async () => {
    
    setLoadingPayment(true)
    try {
      if (!formData) {
        console.error('❌ formData отсутствует!')
        toast.error('Данные формы не найдены')
        return
      }

      if (cartItems.length === 0) {
        console.error('❌ Корзина пуста!')
        toast.error('Корзина пуста')
        return
      }

      const orderData = {
        ...formData,
        items: cartItems.map(item => {
          const product = products.find(p => p.id === item.productId)
          return {
            productId: item.productId,
            name: product?.name,
            quantity: item.quantity,
            price: product?.price
          }
        }),
        total: totalPrice,
        status: 'PENDING_PAYMENT',
        userId: session?.user?.id
      }


      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const orderResult = await orderRes.json()

      if (!orderRes.ok) {
        throw new Error(orderResult.error || 'Ошибка создания заказа')
      }

      const newOrderId = orderResult.orderId
      setOrderId(newOrderId)

      const paymentRes = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice,
          orderId: newOrderId
        })
      })

      const paymentData = await paymentRes.json()

      if (!paymentRes.ok) {
        throw new Error(paymentData.error || 'Ошибка создания платежа')
      }

      setClientSecret(paymentData.clientSecret)
      setShowPayment(true)

      sessionStorage.setItem('paymentState', JSON.stringify({
        showPayment: true,
        clientSecret: paymentData.clientSecret,
        orderId: newOrderId,
        timestamp: Date.now()
      }))

    } catch (error) {
      console.error('❌ Ошибка:', error)
      toast.error(error instanceof Error ? error.message : 'Ошибка при создании платежа')
    } finally {
      setLoadingPayment(false)
    }
  }

  // === ПОРЯДОК РЕНДЕРА ===
  
  // 1. Если редирект — только лоадер
  if (isRedirecting) {
    return <FullscreenLoader />
  }

  // 2. Защита от неавторизованных
  if (status === 'unauthenticated') {
    router.push('/cart')
    return null
  }

  // 3. Показываем скелетон пока загружаются данные
  if (!cartLoaded || loading || loadingFormData) {    
    return <ConfirmPageSkeleton />
  }

  // 4. Если после загрузки нет данных — ошибка
  if (cartItems.length === 0 || !formData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Нет данных для подтверждения</h1>
        <Link href="/cart" className="text-blue-500 hover:underline">
          Вернуться в корзину
        </Link>
      </div>
    )
  }

  // 5. Нормальный рендер
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Подтверждение заказа</h1>

      <div className="mb-6 border rounded-lg p-4 bg-gray-50">
        <h2 className="font-semibold mb-3">Данные доставки</h2>
        <div className="space-y-2">
          <p><span className="font-medium">Имя:</span> {formData.fullName}</p>
          <p><span className="font-medium">Email:</span> {formData.email}</p>
          <p><span className="font-medium">Телефон:</span> {formData.phone}</p>
          <p><span className="font-medium">Адрес:</span> {formData.address}</p>
          <p><span className="font-medium">Оплата:</span> {formData.paymentMethod === 'card' ? 'Картой онлайн' : 'Наличными'}</p>
        </div>
      </div>

      <OrderSummary 
        key={currency}
        cartItems={cartItems} 
        products={products} 
        totalPrice={totalPrice}
        isLoading={loading || products.length === 0}
      />

      {showPayment && clientSecret && orderId ? (
        <div className="border rounded-lg p-4 mt-4">
          <h2 className="text-xl font-semibold mb-4">Оплата картой</h2>
          <LazyStripePayment
            amount={totalPrice}
            displayAmount={displayAmount}
            displayCurrency={currency}
            clientSecret={clientSecret}
            orderId={orderId}
          />
          <button
            onClick={() => setShowPayment(false)}
            className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Вернуться к выбору оплаты
          </button>
        </div>
      ) : (
        <div className="flex gap-4 flex-col sm:flex-row">
          {formData?.paymentMethod === 'cash' ? (
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex-1"
            >
              {submitting ? 'Оформляем...' : 'Подтвердить заказ'}
            </button>
          ) : (
            <button
              onClick={handleStartPayment}
              disabled={loadingPayment}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex-1"
            >
              {loadingPayment ? 'Создаём платёж...' : '💳 Перейти к оплате'}
            </button>
          )}

          <Link
            href="/checkout"
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 text-center"
          >
            Назад
          </Link>
        </div>
      )}
    </div>
  )
}