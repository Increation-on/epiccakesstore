// hooks/useCartSync.ts
'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cart.store'
import { useSession } from 'next-auth/react'

export function useCartSync() {
  const { data: session, status } = useSession()
  const { setItems } = useCartStore()
  
  useEffect(() => {
    const syncCart = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const res = await fetch('/api/cart')
          
          if (!res.ok) {
            console.error('Ошибка загрузки корзины:', res.status)
            return
          }
          
          const text = await res.text() // сначала как текст
          console.log('Ответ от сервера (текст):', text)
          
          if (!text) {
            console.log('Пустой ответ')
            return
          }
          
          const serverItems = JSON.parse(text) // потом парсим
          setItems(serverItems)
        } catch (error) {
          console.error('Ошибка:', error)
        }
      }
    }
    
    syncCart()
  }, [session?.user?.id, status, setItems])
}