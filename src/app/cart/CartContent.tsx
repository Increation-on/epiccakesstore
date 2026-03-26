'use client'

import { useCartStore } from '@/store/cart.store'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Product } from '@/types/domain/product.types'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import { toast } from '@/lib/toast'
import { Modal } from '@/components/ui/Modal'

export default function CartContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Состояние для модалки подтверждения
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    itemId: string | null
    productName: string
    type: 'single' | 'clear'
  }>({
    isOpen: false,
    itemId: null,
    productName: '',
    type: 'single',
  })

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

        if (!res.ok) {
          throw new Error('Ошибка загрузки товаров')
        }

        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error(error)
        toast.error('Не удалось загрузить товары в корзине')
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

  // Функции для модалки
  const openRemoveModal = (itemId: string, productName: string) => {
    setModalState({
      isOpen: true,
      itemId,
      productName,
      type: 'single',
    })
  }

  const openClearModal = () => {
    setModalState({
      isOpen: true,
      itemId: null,
      productName: '',
      type: 'clear',
    })
  }

  const closeModal = () => {
    setModalState({
      isOpen: false,
      itemId: null,
      productName: '',
      type: 'single',
    })
  }

  const confirmAction = () => {
    if (modalState.type === 'single' && modalState.itemId) {
      removeItem(modalState.itemId)
      toast.success(`${modalState.productName} удален из корзины`)
    } else if (modalState.type === 'clear') {
      clearCart()
      toast.success('Корзина очищена')
    }
    closeModal()
  }

  if (cartItems.length === 0) {
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

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Левая колонка — товары */}
        <div className="flex-1 min-w-0 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-(--text-muted)">Загрузка товаров...</div>
          ) : (
            cartItems.map(item => {
              const product = products.find(p => p.id === item.productId)
              if (!product) return null

              return (
                <div
                  key={item.id}
                  className="flex flex-wrap sm:flex-nowrap gap-4 bg-white p-4 rounded-lg shadow-sm border border-(--border)"
                >
                  {/* Картинка */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-(--mint) rounded-lg flex items-center justify-center shrink-0">
                    {(() => {
                      let imageUrl = null
                      try {
                        if (product.images) {
                          if (typeof product.images === 'string') {
                            // 🔥 Парсим JSON строку
                            const parsed = JSON.parse(product.images)
                            imageUrl = Array.isArray(parsed) ? parsed[0] : parsed
                          } else if (Array.isArray(product.images)) {
                            imageUrl = product.images[0]
                          }
                        }
                      } catch (error) {
                        console.error('Error parsing image URL:', error)
                        // Если не распарсилось, пробуем использовать как есть
                        if (typeof product.images === 'string' && product.images.startsWith('http')) {
                          imageUrl = product.images
                        }
                      }

                      console.log('Cart image debug:', {
                        productId: product.id,
                        productName: product.name,
                        imageUrl,
                        isValid: imageUrl && (imageUrl.startsWith('/') || imageUrl.startsWith('http'))
                      })

                      if (imageUrl && (imageUrl.startsWith('/') || imageUrl.startsWith('http'))) {
                        return (
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                              onError={() => console.error('Image failed to load:', imageUrl)}
                            />
                          </div>
                        )
                      }
                      return (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-(--mint) rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-3xl">🍰</span>
                        </div>
                      )
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
                          openRemoveModal(item.id, product.name)
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
                      onClick={() => openRemoveModal(item.id, product.name)}
                      className="ml-2 text-gray-400 hover:text-red-500 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })
          )}
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
              onClick={openClearModal}
              className="w-full mt-3 text-sm text-(--text-muted) hover:text-red-500 transition"
            >
              Очистить корзину
            </button>
          </div>
        </div>
      </div>

      {/* Модалка подтверждения */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.type === 'clear' ? 'Очистка корзины' : 'Удаление товара'}
      >
        <p className="text-(--text-muted) mb-6">
          {modalState.type === 'clear'
            ? 'Вы уверены, что хотите очистить всю корзину?'
            : `Вы уверены, что хотите удалить "${modalState.productName}" из корзины?`}
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={closeModal}>
            Отмена
          </Button>
          <Button onClick={confirmAction} className="bg-red-500 hover:bg-red-600">
            Удалить
          </Button>
        </div>
      </Modal>

      {/* Модалка авторизации */}
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