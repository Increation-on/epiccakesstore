// app/checkout/_components/CheckoutContent.tsx
'use client'

import { useCartStore } from '@/store/cart.store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Product } from '@/types/domain/product.types'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'  
import { Price } from '@/components/ui/Price'
import CheckoutSkeleton from '@/components/features/skeleton/CheckoutSkeleton'

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  phone: z.string().min(10, 'Телефон должен содержать минимум 10 символов'),
  address: z.string().min(5, 'Адрес должен содержать минимум 5 символов'),
  paymentMethod: z.enum(['card', 'cash']).refine(val => val, {
    message: 'Выберите способ оплаты'
  })
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutContent() {
  const router = useRouter()
  const { items } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isReady, setIsReady] = useState(false) // ← Флаг готовности к рендеру

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema)
  })

  const cartItems = Array.isArray(items) ? items : []

  // Проверка при загрузке - не завершен ли уже заказ
  useEffect(() => {
    const orderCompleted = sessionStorage.getItem('orderCompleted')
    
    if (orderCompleted) {
      sessionStorage.removeItem('orderCompleted')
      window.location.href = '/cart'
      return
    }
  }, [])

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      setIsReady(false) // ← Сбрасываем готовность при начале загрузки
      
      if (cartItems.length === 0) {
        setProducts([])
        setLoading(false)
        // Небольшая задержка чтобы избежать мигания
        setTimeout(() => setIsReady(true), 50)
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
        toast.error('Не удалось загрузить товары. Обновите страницу')
        setProducts([])
      } finally {
        setLoading(false)
        // Небольшая задержка чтобы избежать мигания
        setTimeout(() => setIsReady(true), 50)
      }
    }

    loadProducts()
  }, [cartItems.length])

  const totalPrice = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)
    return sum + (product?.price || 0) * (item?.quantity || 0)
  }, 0)

  const onSubmit = async (data: CheckoutFormData) => {
    setSubmitting(true)
    
    try {
      sessionStorage.setItem('checkoutFormData', JSON.stringify(data))
      
      setTimeout(() => {
        window.location.href = '/checkout/confirm'
      }, 100)
      
    } catch (error) {
      console.error('🔴 [Checkout] Ошибка:', error)
      toast.error('Ошибка при сохранении данных')
      setSubmitting(false)
    }
  }

  // Показываем скелетон пока не готовы
  if (!isReady || loading) {
    return <CheckoutSkeleton />
  }

  // Если корзина пуста после загрузки — показываем сообщение
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

  // Показываем форму
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Оформление заказа</h1>

      {/* Список товаров */}
      <div className="mb-6 border border-(--border) rounded-lg p-4 bg-(--bg)">
        <h2 className="font-semibold mb-2">Ваш заказ:</h2>
        {cartItems.map(item => {
          const product = products.find(p => p.id === item.productId)
          return (
            <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
              <span>{product?.name || '...'} x{item.quantity}</span>
              <span><Price price={product?.price || 0} /></span>
            </div>
          )
        })}
        <div className="flex justify-between font-bold mt-2 pt-2 border-t">
          <span>Итого:</span>
          <span><Price price={totalPrice} /></span>
        </div>
      </div>

      {/* Форма с валидацией */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Имя *</label>
          <input
            type="text"
            {...register('fullName')}
            className={`w-full p-2 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) ${errors.fullName ? 'border-red-500' : ''}`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Email *</label>
          <input
            type="email"
            {...register('email')}
            className={`w-full p-2 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Телефон *</label>
          <input
            type="tel"
            {...register('phone')}
            className={`w-full p-2 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) ${errors.phone ? 'border-red-500' : ''}`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Адрес доставки *</label>
          <textarea
            {...register('address')}
            rows={3}
            className={`w-full p-2 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) ${errors.address ? 'border-red-500' : ''}`}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Способ оплаты */}
        <div>
          <label className="block mb-1 font-medium">Способ оплаты *</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="card"
                {...register('paymentMethod')}
                className="w-4 h-4 accent-(--pink)"
              />
              <span>Картой онлайн</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="cash"
                {...register('paymentMethod')}
                className="w-4 h-4 accent-(--pink)"
              />
              <span>Наличными при получении</span>
            </label>
          </div>
          {errors.paymentMethod && (
            <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="w-full sm:w-auto"
          >
            {submitting ? 'Сохраняем...' : 'Продолжить'}
          </Button>

          <Link href="/cart">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Назад
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}