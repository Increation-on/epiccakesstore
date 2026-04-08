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
import CartSkeleton from '@/components/features/skeleton/CartSkeleton'
import { ProductStockStatus } from '@/components/features/products/ProductStockStatus'
import { Price } from '@/components/ui/Price'

export default function CartContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const isLoggedIn = !!session
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [archivedProducts, setArchivedProducts] = useState<any[]>([])

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

  // Когда корзина загрузилась
  useEffect(() => {
    if (items !== undefined) {
      setIsCartLoading(false)
    }
  }, [items])

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

  // Проверка архивных товаров при загрузке продуктов
  useEffect(() => {
    if (products.length > 0 && cartItems.length > 0) {
      const archived = cartItems.filter(item => {
        const product = products.find(p => p.id === item.productId)
        return product?.isArchived === true
      }).map(item => {
        const product = products.find(p => p.id === item.productId)
        return {
          id: item.id,
          productName: product?.name || 'Товар'
        }
      })
      
      if (archived.length > 0) {
        setArchivedProducts(archived)
        setShowArchiveModal(true)
      }
    }
  }, [products, cartItems])

  const handleRemoveArchived = () => {
    archivedProducts.forEach(item => {
      removeItem(item.id)
    })
    setShowArchiveModal(false)
    toast.success('Недоступные товары удалены из корзины')
  }

  const totalPrice = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)
    return sum + (product?.price || 0) * (item?.quantity || 0)
  }, 0)

  const handleCheckout = () => {
    // Проверяем, нет ли архивных товаров перед переходом
    const hasArchived = cartItems.some(item => {
      const product = products.find(p => p.id === item.productId)
      return product?.isArchived === true
    })
    
    if (hasArchived) {
      toast.error('Удалите недоступные товары из корзины')
      return
    }
    
    router.push('/checkout')
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

  // Пока загружается корзина — показываем скелетон
  if (isCartLoading || loading) {
    return <CartSkeleton />
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
          {cartItems.map(item => {
            const product = products.find(p => p.id === item.productId)
            if (!product) return null

            // Если товар архивный — показываем его с пометкой
            const isArchived = product.isArchived === true
            const remainingStock = product.stock - item.quantity

            return (
              <div
                key={item.id}
                className={`flex flex-col gap-4 bg-white p-4 rounded-lg shadow-sm border ${isArchived ? 'border-red-300 bg-red-50' : 'border-(--border)'}`}
              >
                {/* Верхняя часть: картинка слева, текст справа */}
                <div className="flex gap-4 items-center">
                  {/* Картинка */}
                  <div className="shrink-0 cursor-pointer" onClick={() => router.push(`/products/${product.id}`)}>
                    {(() => {
                      let imageUrl = null
                      try {
                        if (product.images) {
                          if (typeof product.images === 'string') {
                            const parsed = JSON.parse(product.images)
                            imageUrl = Array.isArray(parsed) ? parsed[0] : parsed
                          } else if (Array.isArray(product.images)) {
                            imageUrl = product.images[0]
                          }
                        }
                      } catch (error) {
                        if (typeof product.images === 'string' && product.images.startsWith('http')) {
                          imageUrl = product.images
                        }
                      }

                      if (imageUrl && (imageUrl.startsWith('/') || imageUrl.startsWith('http'))) {
                        return (
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
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

                  {/* Текст: название и цена */}
                  <div className="flex-1 min-w-0 flex justify-center flex-col">
                    <h3 className="font-semibold text-(--text) line-clamp-2 wrap-break-word text-center">
                      {product.name}
                    </h3>
                    <p className="text-(--pink) font-bold mt-1 text-center">
                      <Price price={product.price} />
                    </p>
                    {isArchived ? (
                      <span className="text-red-500 text-sm text-center mt-1">
                        ❌ Товар больше не доступен
                      </span>
                    ) : (
                      <div className="mt-2 flex justify-center">
                        <ProductStockStatus stock={product.stock} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Нижняя часть: кнопки */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-end gap-2 border-t pt-3">
                    <button
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQuantity(item.id, item.quantity - 1)
                        } else {
                          openRemoveModal(item.id, product.name)
                        }
                      }}
                      disabled={isArchived}
                      className={`w-8 h-8 rounded-full bg-(--mint) text-(--text) transition ${isArchived ? 'opacity-50 cursor-not-allowed' : 'hover:bg-(--mint-dark)'}`}
                    >
                      -
                    </button>

                    <span className="w-8 text-center font-medium">{item.quantity}</span>

                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={isArchived || item.quantity >= product.stock}
                      className={`w-8 h-8 rounded-full bg-(--mint) text-(--text) transition ${
                        isArchived || item.quantity >= product.stock 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-(--mint-dark)'
                      }`}
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

                  {/* Подсказка об остатке */}
                  {!isArchived && remainingStock > 0 && remainingStock <= 3 && (
                    <p className="text-xs text-amber-600 text-right">
                      ⚠️ Осталось всего {remainingStock} шт. Товар не зарезервирован до оплаты.
                    </p>
                  )}
                  
                  {!isArchived && remainingStock === 0 && (
                    <p className="text-xs text-red-500 text-right">
                      ❌ Вы добавили максимальное количество
                    </p>
                  )}
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
                <span><Price price={totalPrice}/></span>
              </div>
              <div className="flex justify-between text-(--text-muted)">
                <span>Доставка</span>
                <span>Бесплатно</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-(--text)">
                  <span>Итого</span>
                  <span className="text-xl text-(--pink)"><Price price={totalPrice}/></span>
                </div>
              </div>
            </div>

            {isLoggedIn ? (
              <Button onClick={handleCheckout} size="lg" className="w-full">
                Оформить заказ
              </Button>
            ) : (
              <Link href="/login">
                <Button size="lg" className="w-full" variant="outline">
                  Войдите, чтобы оформить заказ
                </Button>
              </Link>
            )}

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

      {/* Модалка архивных товаров */}
      <Modal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        title="Товары больше не доступны"
      >
        <p className="text-(--text-muted) mb-4">
          Следующие товары больше не доступны и будут удалены из вашей корзины:
        </p>
        <ul className="mb-6 space-y-1">
          {archivedProducts.map(item => (
            <li key={item.id} className="text-red-500">
              • {item.productName}
            </li>
          ))}
        </ul>
        <div className="flex gap-3 justify-end">
          <Button onClick={handleRemoveArchived}>
            Убрать товары
          </Button>
        </div>
      </Modal>
    </div>
  )
}