import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartStore, CartItem } from '@/types/domain/cart.types';
import { toast } from '@/lib/toast';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isAuthenticated: false, // для типа
      
      setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),

      addItem: async (productId, quantity = 1) => {
        try {
          const res = await fetch(`/api/products/${productId}/check`);
          const { isArchived } = await res.json();
          if (isArchived) {
            toast.error('Этот товар больше не доступен');
            return;
          }
        } catch (error) {
          console.error('Error checking product:', error);
          toast.error('Ошибка при проверке товара');
          return;
        }

        set((state) => {
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
            return { items: [...state.items, newItem] };
          }
        });

        const { items } = get();
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        }).catch((error) => {
          console.error('❌ Ошибка синхронизации корзины:', error);
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(i => i.id !== id)
        }));
        const { items } = get();
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        }).catch((error) => {
          console.error('❌ Ошибка синхронизации удаления:', error);
        });
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map(i =>
            i.id === id ? { ...i, quantity } : i
          )
        }));
        const { items } = get();
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        }).catch((error) => {
          console.error('❌ Ошибка синхронизации обновления:', error);
        });
      },

      clearCart: () => {
        set({ items: [] });
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [] })
        }).catch((error) => {
          console.error('❌ Ошибка очистки корзины на сервере:', error);
        });
      },

      setItems: (newItems) => {
        set({ items: newItems });
      },

      get totalItems() {
        const state = get();
        if (!state || !Array.isArray(state.items)) return 0;
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);