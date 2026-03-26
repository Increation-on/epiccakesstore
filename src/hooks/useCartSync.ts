'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cart.store'
import { useSession } from 'next-auth/react'
import { toast } from '@/lib/toast'

export function useCartSync() {
  const { data: session, status } = useSession()
  const { items, setItems, clearCart } = useCartStore()
  
  // 1. Загрузка с сервера при входе
  useEffect(() => {
    const syncCart = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const res = await fetch('/api/cart')
          
          if (!res.ok) {
            console.error('❌ Ошибка загрузки корзины:', res.status)
            toast.error('Не удалось загрузить корзину')
            return
          }
          
          const serverCart = await res.json()
          setItems(serverCart)
          
        } catch (error) {
          console.error('❌ Ошибка:', error)
          toast.error('Ошибка синхронизации корзины')
        }
      }
    }
    
    syncCart()
  }, [session?.user?.id, status, setItems])
  
  // 2. Отправка изменений на сервер (с debounce)
  useEffect(() => {
    const saveCart = async () => {
      if (status === 'authenticated' && session?.user?.id && items.length > 0) {
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
          })
          
          if (!res.ok) {
            console.error('❌ Ошибка сохранения корзины:', res.status)
            toast.error('Не удалось сохранить корзину')
          } else {
            console.log('✅ Корзина сохранена на сервер')
          }
        } catch (error) {
          console.error('❌ Ошибка:', error)
          toast.error('Ошибка при сохранении корзины')
        }
      }
    }
    
    // Добавляем debounce — ждём 500ms после последнего изменения
    const timeoutId = setTimeout(saveCart, 500)
    return () => clearTimeout(timeoutId)
    
  }, [items, session?.user?.id, status])

  // 3. Очистка корзины при выходе
  useEffect(() => {
    if (status === 'unauthenticated') {
      const wasAuthenticated = sessionStorage.getItem('wasAuthenticated')
      
      if (wasAuthenticated) {
        console.log('🔄 Пользователь вышел, очищаем корзину')
        localStorage.removeItem('cart-storage')
        clearCart()
        sessionStorage.removeItem('checkoutFormData')
        sessionStorage.removeItem('paymentState')
        sessionStorage.removeItem('pendingCart')
        sessionStorage.removeItem('wasAuthenticated')
      }
    }
    
    if (status === 'authenticated') {
      sessionStorage.setItem('wasAuthenticated', 'true')
    }
  }, [status, clearCart])
}