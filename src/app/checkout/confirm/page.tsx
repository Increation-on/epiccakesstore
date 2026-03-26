'use client'

export const dynamic = 'force-dynamic'

import { useCartStore } from '@/store/cart.store'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Product } from '@/types/domain/product.types'
import Link from 'next/link'
import { LazyStripePayment } from '@/components/features/payment/LazyStripePayment'
import { useSession } from 'next-auth/react'
import { toast } from '@/lib/toast'

export default function ConfirmPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const { items, setItems, addItem, clearCart } = useCartStore()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [loadingPayment, setLoadingPayment] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [orderId, setOrderId] = useState<string | null>(null)
    const [cartLoaded, setCartLoaded] = useState(false)

    // Получаем данные из sessionStorage (где сохранили после шага 1)
    const [formData, setFormData] = useState<any>(null)

    const cartItems = Array.isArray(items) ? items : []


    // 🔥 НОВОЕ: Перенос корзины после входа/регистрации
    useEffect(() => {
        const transferCart = async () => {
            // Проверяем, есть ли параметр cartTransfer в URL
            const urlParams = new URLSearchParams(window.location.search)
            const shouldTransfer = urlParams.get('cartTransfer') === 'true'

            if (session && shouldTransfer && status === 'authenticated') {
                console.log('🔄 Переносим гостевую корзину в БД')

                // Получаем гостевую корзину из localStorage
                const savedCart = localStorage.getItem('cart-storage')
                if (savedCart) {
                    const guestCart = JSON.parse(savedCart)
                    const items = guestCart.state?.items || []

                    if (items.length > 0) {
                        // 1. Получаем текущую корзину пользователя
                        const userCartRes = await fetch('/api/cart')
                        const userCart = await userCartRes.json()

                        // 2. Объединяем корзины
                        const mergedItems = [...userCart]

                        items.forEach((guestItem: any) => {
                            const existing = mergedItems.find(
                                (item: any) => item.productId === guestItem.productId
                            )

                            if (existing) {
                                // Если товар уже есть — увеличиваем количество
                                existing.quantity += guestItem.quantity
                            } else {
                                // Если нет — добавляем новый
                                mergedItems.push({
                                    id: crypto.randomUUID(),
                                    productId: guestItem.productId,
                                    quantity: guestItem.quantity,
                                    addedAt: new Date().toISOString()
                                })
                            }
                        })

                        // 3. Отправляем объединённую корзину на сервер
                        await fetch('/api/cart', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ items: mergedItems })
                        })

                        // 4. Обновляем стор
                        setItems(mergedItems)
                    }
                }

                // Убираем параметр из URL
                const url = new URL(window.location.href)
                url.searchParams.delete('cartTransfer')
                window.history.replaceState({}, '', url.toString())
            }
        }

        transferCart()
    }, [session, status, setItems])

  // Восстанавливаем состояние оплаты при загрузке
useEffect(() => {
    const savedPaymentState = sessionStorage.getItem('paymentState')
    console.log('📦 savedPaymentState:', savedPaymentState)
    
    if (savedPaymentState) {
        const { showPayment, clientSecret, orderId, timestamp } = JSON.parse(savedPaymentState)
        console.log('📦 restored:', { showPayment, clientSecret, orderId, timestamp })
        
        // Проверяем, что прошло не больше 5 минут
        if (timestamp && Date.now() - timestamp < 5 * 60 * 1000) {
            // Проверим статус заказа
            fetch(`/api/orders/${orderId}`)
                .then(res => res.json())
                .then(order => {
                    console.log('📦 Статус заказа:', order.status)
                    // Если заказ уже оплачен или не в статусе ожидания — сбрасываем
                    if (order.status === 'PAID' || order.status === 'DELIVERED') {
                        console.log('🔄 Заказ уже оплачен, сбрасываем paymentState')
                        sessionStorage.removeItem('paymentState')
                        setShowPayment(false)
                        setClientSecret(null)
                        setOrderId(null)
                    } else {
                        console.log('🔄 Восстанавливаем платёж')
                        setShowPayment(showPayment)
                        setClientSecret(clientSecret)
                        setOrderId(orderId)
                    }
                })
                .catch(() => {
                    console.log('🔄 Не удалось получить заказ, сбрасываем')
                    sessionStorage.removeItem('paymentState')
                    setShowPayment(false)
                    setClientSecret(null)
                    setOrderId(null)
                })
        } else {
            console.log('🔄 paymentState устарел (больше 5 минут)')
            sessionStorage.removeItem('paymentState')
        }
    }
}, [])

    // Сохраняем состояние оплаты при изменении
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

    useEffect(() => {
        // Загружаем товары
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
                console.error(error)
                setProducts([])
            } finally {
                setLoading(false)
            }
        }

        // Получаем данные формы из sessionStorage
        const savedData = sessionStorage.getItem('checkoutFormData')
        console.log('📦 savedData:', savedData)
        if (savedData) {
            setFormData(JSON.parse(savedData))
        } else {
            // Если нет данных - возвращаем на форму
            router.push('/checkout')
        }

        loadProducts()
    }, [cartItems.length, router])

    const totalPrice = cartItems.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId)
        return sum + (product?.price || 0) * (item?.quantity || 0)
    }, 0)

    const handleConfirm = async () => {
        setSubmitting(true)

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
            status: 'PENDING',
            userId: session?.user?.id
        }

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            })

            const result = await res.json()

            if (res.ok) {
                sessionStorage.removeItem('checkoutFormData')
                sessionStorage.removeItem('paymentState')
                clearCart()
                window.location.href = `/order/${result.orderId}/success`
            } else {
              toast.error(result.error || 'Ошибка при оформлении заказа')
            }
        } catch (error) {
            console.error('Ошибка:', error)
             toast.error('Ошибка при отправке заказа')
        } finally {
            setSubmitting(false)
        }
    }

    const handleTestPayment = async () => {
        setLoadingPayment(true)
        try {
            const res = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: totalPrice })
            })

            const data = await res.json()
            console.log('✅ PaymentIntent создан:', data)
            
        } catch (error) {
            console.error('Ошибка:', error)
            
        } finally {
            setLoadingPayment(false)
        }
    }

    const handleStartPayment = async () => {
        setLoadingPayment(true)
        try {
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
            setClientSecret(paymentData.clientSecret)
            setShowPayment(true)

            sessionStorage.setItem('paymentState', JSON.stringify({
                showPayment: true,
                clientSecret: paymentData.clientSecret,
                orderId: newOrderId,
                timestamp: Date.now()
            }))

        } catch (error) {
            console.error('Ошибка:', error)
            toast.error('❌ Ошибка при создании платежа')
        } finally {
            setLoadingPayment(false)
        }
    }

    const handlePaymentSuccess = async () => {
    if (!orderId) {
        console.error('Нет orderId')
        return
    }

    try {
        // Используем существующий эндпоинт /api/orders/[id]/paid
        const res = await fetch(`/api/orders/${orderId}/paid`, {
            method: 'POST',  // У тебя POST в роуте
            headers: { 'Content-Type': 'application/json' }
            // Тело не нужно, статус уже PAID в эндпоинте
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Ошибка при обновлении статуса')
        }

        // Очищаем все и редиректим на страницу успеха
        sessionStorage.removeItem('checkoutFormData')
        sessionStorage.removeItem('paymentState')
        clearCart()
        window.location.href = `/order/${orderId}/success`
    } catch (error) {
        console.error('Ошибка:', error)
        toast.error('Ошибка при подтверждении оплаты')
    }
}

    // Защита от неавторизованных
    if (status === 'unauthenticated') {
        router.push('/cart')
        return null
    }

    if (!cartLoaded) {
        return <div className="container mx-auto p-4 text-center">Загрузка корзины...</div>
    }

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

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Подтверждение заказа</h1>

            {loading ? (
                <div>Загрузка...</div>
            ) : (
                <>
                    {/* Данные доставки */}
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

                    {/* Состав заказа */}
                    <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                        <h2 className="font-semibold mb-3">Состав заказа</h2>
                        {cartItems.map(item => {
                            const product = products.find(p => p.id === item.productId)
                            return (
                                <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                                    <span>{product?.name} x{item.quantity}</span>
                                    <span>{product?.price} ₽</span>
                                </div>
                            )
                        })}
                        <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                            <span>Итого:</span>
                            <span>{totalPrice} ₽</span>
                        </div>
                    </div>

                    {/* Кнопки или форма оплаты */}
                    {showPayment && clientSecret && orderId ? (
                        <div className="border rounded-lg p-4 mt-4">
                            <h2 className="text-xl font-semibold mb-4">Оплата картой</h2>
                            <LazyStripePayment
                                amount={totalPrice}
                                clientSecret={clientSecret}
                                orderId={orderId}
                                onSuccess={handlePaymentSuccess}
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

                </>
            )}
        </div>
    )
}