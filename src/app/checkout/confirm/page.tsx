'use client'

import { useCartStore } from '@/store/cart.store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Product } from '@/types/domain/product.types'
import Link from 'next/link'

export default function ConfirmPage() {
    const router = useRouter()
    const { items, clearCart } = useCartStore()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Получаем данные из sessionStorage (где сохранили после шага 1)
    const [formData, setFormData] = useState<any>(null)

    const cartItems = Array.isArray(items) ? items : []

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
        total: totalPrice
    }

    console.log('✅ Отправляем заказ:', orderData)

    try {
        // Отправляем на API
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        })

        const result = await res.json()
        console.log('Ответ от сервера:', result)

        if (res.ok) {
            // Всё хорошо - чистим и редиректим
            sessionStorage.removeItem('checkoutFormData')
            clearCart()
            alert('✅ Заказ оформлен!')
            window.location.href = `/order/${result.orderId}/success`
        } else {
            // Ошибка от сервера
            alert('❌ Ошибка при оформлении заказа: ' + (result.error || 'Неизвестная ошибка'))
        }
    } catch (error) {
        console.error('Ошибка:', error)
        alert('❌ Ошибка при отправке заказа')
    } finally {
        setSubmitting(false)
    }
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

                    {/* Кнопки */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleConfirm}
                            disabled={submitting}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex-1"
                        >
                            {submitting ? 'Оформляем...' : 'Подтвердить заказ'}
                        </button>

                        <Link
                            href="/checkout"
                            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                        >
                            Назад
                        </Link>
                    </div>
                </>
            )}
        </div>
    )
}