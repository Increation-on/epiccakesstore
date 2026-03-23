'use client'

import { useCartStore } from '@/store/cart.store'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Product } from '@/types/domain/product.types'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import CartSkeleton from '@/components/features/skeleton/CartSkeleton'

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

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold text-(--text) mb-4 font-serif">
            Корзина пуста
          </h1>
          <p className="text-(--text-muted) mb-8">
            Похоже, вы ещё ничего не выбрали. Загляните в каталог — у нас много вкусного!
          </p>
          <Link href="/products">
            <Button size="lg">Перейти в каталог</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 overflow-x-hidden">
      <h1 className="text-3xl font-bold text-(--text) mb-8 font-serif">
        🛒 Корзина
      </h1>

      {loading ? (
        <CartSkeleton />
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Левая колонка — товары */}
          <div className="flex-1 min-w-0 space-y-4">
            {cartItems.map(item => {
              const product = products.find(p => p.id === item.productId)
              if (!product) return null

              return (
                <div key={item.id} className="flex flex-wrap sm:flex-nowrap gap-4 bg-white p-4 rounded-lg shadow-sm border border-(--border)">
                  {/* Картинка */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-(--mint) rounded-lg flex items-center justify-center shrink-0">
                    {(() => {
                      const imageUrl = product.images
                        ? (typeof product.images === 'string' ? product.images : product.images[0])
                        : null
                      if (imageUrl && imageUrl.startsWith('http')) {
                        return (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            width={80}
                            height={80}
                            className="object-cover rounded"
                          />
                        )
                      }
                      return <span className="text-3xl">🍰</span>
                    })()}
                  </div>

                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-(--text) mb-1 wrap-break-word">
                      {product.name}
                    </h3>
                    <p className="text-(--pink) font-bold">{product.price} BYN</p>
                  </div>

                  {/* Кнопки +/- */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQuantity(item.id, item.quantity - 1)
                        } else {
                          if (confirm('Удалить товар из корзины?')) removeItem(item.id)
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-(--mint) text-(--text) hover:bg-(--mint-dark) transition"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-(--mint) text-(--text) hover:bg-(--mint-dark) transition"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-2 text-gray-400 hover:text-red-500 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Правая колонка — итог */}
          <div className="lg:w-80 w-full">
            <div className="bg-(--bg) p-6 rounded-lg border border-(--border)">
              <h2 className="text-xl font-semibold text-(--text) mb-4 font-serif">
                Итого
              </h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-(--text-muted)">
                  <span>Товары</span>
                  <span>{totalPrice} BYN</span>
                </div>
                <div className="flex justify-between text-(--text-muted)">
                  <span>Доставка</span>
                  <span>Бесплатно</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-(--text)">
                    <span>Итого</span>
                    <span className="text-xl text-(--pink)">{totalPrice} BYN</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleCheckout} size="lg" className="w-full">
                Оформить заказ
              </Button>

              <button
                onClick={clearCart}
                className="w-full mt-3 text-sm text-(--text-muted) hover:text-red-500 transition"
              >
                Очистить корзину
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <h2 className="text-2xl font-bold text-(--text) mb-4 font-serif">
              Необходима авторизация
            </h2>
            <p className="text-(--text-muted) mb-6">
              Чтобы оформить заказ, пожалуйста, войдите или зарегистрируйтесь.
              Ваши товары сохранятся и будут перенесены в ваш аккаунт.
            </p>
            <div className="space-y-3">
              <Link
                href="/api/auth/signin?callbackUrl=/checkout/confirm&cartTransfer=true"
                className="block w-full text-center bg-(--pink) text-white px-4 py-2 rounded hover:bg-(--pink-dark) transition"
                onClick={() => setShowAuthModal(false)}
              >
                Войти
              </Link>
              <Link
                href="/register?callbackUrl=/checkout/confirm&cartTransfer=true"
                className="block w-full text-center bg-(--mint) text-(--text) px-4 py-2 rounded hover:bg-(--mint-dark) transition"
                onClick={() => setShowAuthModal(false)}
              >
                Зарегистрироваться
              </Link>
              <button
                onClick={() => setShowAuthModal(false)}
                className="block w-full text-center bg-gray-200 text-(--text) px-4 py-2 rounded hover:bg-gray-300 transition"
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