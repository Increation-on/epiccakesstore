'use client'

import { useCartStore } from '@/store/cart.store'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Product } from '@/types/domain/product.types'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const cartItems = Array.isArray(items) ? items : []

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

  const totalPrice = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)
    return sum + (product?.price || 0) * (item?.quantity || 0)
  }, 0)

  const handleCheckout = () => {
    if (!session) {
      setShowAuthModal(true)
    } else {
      router.push('/checkout/confirm')
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Корзина пуста</h1>
        <Link href="/products" className="text-blue-500 hover:underline">
          Перейти в каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Корзина</h1>

      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map(item => {
              const product = products.find(p => p.id === item.productId)
              return (
                <div key={item.id} className="border p-4 rounded flex justify-between">
                  <div>
                    <div>{product?.name || 'Товар не найден'}</div>
                    <div>{product?.price || 0} ₽ x {item.quantity}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button onClick={() => {
                      if (item.quantity > 1) {
                        updateQuantity(item.id, item.quantity - 1)
                      } else {
                        if (confirm('Удалить?')) removeItem(item.id)
                      }
                    }}>-</button>
                    <button onClick={() => removeItem(item.id)}>Удалить</button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 text-xl font-bold">
            Итого: {totalPrice} ₽
          </div>

          <button
            onClick={handleCheckout}
            className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg mr-4 hover:bg-green-700 transition"
          >
            Оформить заказ
          </button>

          <button onClick={clearCart} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
            Очистить корзину
          </button>
        </>
      )}

      {/* Модалка для неавторизованных */}
      {/* Модалка для неавторизованных */}
      {/* Модалка для неавторизованных */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-4">Необходима авторизация</h2>
            <p className="mb-4">
              Чтобы оформить заказ, пожалуйста, войдите или зарегистрируйтесь.
              Ваши товары сохранятся и будут перенесены в ваш аккаунт.
            </p>
            <div className="space-y-3">
              <Link
                href="/api/auth/signin?callbackUrl=/checkout/confirm&cartTransfer=true"
                className="block w-full text-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => setShowAuthModal(false)}
              >
                Войти
              </Link>

              <div className="text-center text-sm text-gray-500">или</div>

              <Link
                href="/register?callbackUrl=/checkout/confirm&cartTransfer=true"
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setShowAuthModal(false)}
              >
                Зарегистрироваться
              </Link>

              <button
                onClick={() => setShowAuthModal(false)}
                className="block w-full text-center bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}