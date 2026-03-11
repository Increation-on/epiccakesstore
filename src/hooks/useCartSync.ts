'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cart.store'
import { useSession } from 'next-auth/react'

export function useCartSync() {
  const { data: session, status } = useSession()
  const { items, setItems, clearCart } = useCartStore()
  
  // 1. Загрузка с сервера при входе
  useEffect(() => {
    const syncCart = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          console.log('🔄 Загружаем корзину с сервера')
          
          const res = await fetch('/api/cart')
          
          if (!res.ok) {
            console.error('❌ Ошибка загрузки корзины:', res.status)
            return
          }
          
          const serverCart = await res.json()
          console.log('📦 Серверная корзина:', serverCart)
          
          setItems(serverCart)
          
        } catch (error) {
          console.error('❌ Ошибка:', error)
        }
      }
    }
    
    syncCart()
  }, [session?.user?.id, status, setItems])
  
  // 2. Отправка изменений на сервер
  useEffect(() => {
    const saveCart = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        console.log('🔄 Сохраняем корзину на сервер:', items)
        
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        })
        
        if (!res.ok) {
          console.error('❌ Ошибка сохранения корзины:', res.status)
        } else {
          console.log('✅ Корзина сохранена на сервер')
        }
      }
    }
    
    saveCart()
  }, [items, session?.user?.id, status])

  // 3. Очистка корзины при выходе (только если был авторизован)
useEffect(() => {
  if (status === 'unauthenticated') {
    // Проверяем, был ли пользователь только что авторизован
    const wasAuthenticated = sessionStorage.getItem('wasAuthenticated')
    
    if (wasAuthenticated) {
      console.log('🔄 Пользователь вышел, очищаем корзину')
      
      // Очищаем localStorage
      localStorage.removeItem('cart-storage')
      
      // Очищаем стор
      clearCart()
      
      // Очищаем sessionStorage
      sessionStorage.removeItem('checkoutFormData')
      sessionStorage.removeItem('paymentState')
      sessionStorage.removeItem('pendingCart')
      sessionStorage.removeItem('wasAuthenticated')
    } else {
      console.log('👤 Гость на сайте, сохраняем корзину в localStorage')
      // Для гостей корзина уже загрузится из localStorage через persist
    }
  }
  
  // Запоминаем, что пользователь был авторизован
  if (status === 'authenticated') {
    sessionStorage.setItem('wasAuthenticated', 'true')
  }
}, [status, clearCart])
}