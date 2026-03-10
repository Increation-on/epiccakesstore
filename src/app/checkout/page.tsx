'use client'

import { useCartStore } from '@/store/cart.store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Product } from '@/types/domain/product.types'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const cartItems = Array.isArray(items) ? items : []
  
  // Загружаем товары для отображения
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
        console.error(error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [cartItems.length])
  
  // Если корзина пуста - редирект или показываем сообщение
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Корзина пуста</h1>
        <p className="mb-4">Нельзя оформить заказ с пустой корзиной</p>
        <Link href="/cart" className="text-blue-500 hover:underline">
          Вернуться в корзину
        </Link>
      </div>
    )
  }
  
  const totalPrice = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)
    return sum + (product?.price || 0) * (item?.quantity || 0)
  }, 0)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const orderData = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
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
    
    // TODO: отправка на сервер
    console.log('Заказ:', orderData)
    
    // Имитация отправки
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('Заказ оформлен! (тестовый режим)')
    clearCart()
    router.push('/')
  }
  
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Оформление заказа</h1>
      
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <>
          {/* Список товаров */}
          <div className="mb-6 border rounded-lg p-4 bg-gray-50">
            <h2 className="font-semibold mb-2">Ваш заказ:</h2>
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
          
          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Имя *</label>
              <input
                type="text"
                name="fullName"
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Email *</label>
              <input
                type="email"
                name="email"
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Телефон *</label>
              <input
                type="tel"
                name="phone"
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Адрес доставки *</label>
              <textarea
                name="address"
                required
                rows={3}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Оформляем...' : 'Подтвердить заказ'}
              </button>
              
              <Link
                href="/cart"
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
              >
                Назад
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  )
}