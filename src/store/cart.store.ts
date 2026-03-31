import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartStore, CartItem } from '@/types/domain/cart.types';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId, quantity = 1) => set((state) => {
        const existing = state.items.find(i => i.productId === productId);

        if (existing) {
          return {
            items: state.items.map(i =>
              i.productId === productId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
          };
        } else {
          const newItem: CartItem = {
            id: crypto.randomUUID(),
            productId: productId,
            quantity: quantity,
            addedAt: new Date().toISOString()
          };

          return {
            items: [...state.items, newItem]
          };
        }
      }),

      removeItem: (id) => {
        // Обновляем локально
        set((state) => ({
          items: state.items.filter(i => i.id !== id)
        }))

        // Фоновая синхронизация с сервером
        const { items } = get()
        const updatedItems = items.filter(i => i.id !== id)
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: updatedItems})
        }).catch((error) => {
          console.error('❌ Ошибка синхронизации удаления:', error)
        })
      },

      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.id === id ? { ...i, quantity } : i
        )
      })),

      clearCart: () => {
        // Очищаем локально
        set({ items: [] })
        localStorage.removeItem('cart-storage')

        // Фоновая очистка на сервере
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [] })
        }).catch((error) => {
          console.error('❌ Ошибка очистки корзины на сервере:', error)
        })
      },

      setItems: (newItems) => {
        console.log('🟢 setItems вызван с:', newItems, 'время:', new Date().toISOString())
        console.trace('🟢 Стек вызова setItems:')  // покажет кто вызвал
        set({ items: newItems })
      },

      get totalItems() {
        try {
          const state = get()
          if (!state || !state.items) return 0
          return state.items.reduce((sum, item) => sum + item.quantity, 0)
        } catch {
          return 0
        }
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items
      }),
      onRehydrateStorage: (state) => {
        console.log('🔄 Загружаем из localStorage...')
        return (restoredState, error) => {
          if (error) {
            console.error('❌ Ошибка загрузки:', error)
          } else {
            console.log('✅ Загружено:', restoredState)
          }
        }
      }
    }
  )
);

// Для отладки в консоли
if (typeof window !== 'undefined') {
  (window as any).cartStore = useCartStore;
}