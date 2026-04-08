import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartStore, CartItem } from '@/types/domain/cart.types'
import { toast } from '@/lib/toast'

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isAuthenticated: false,
      
      setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),

      addItem: async (productId, quantity = 1) => {
        // 1. Проверяем остаток через by-ids
        try {
          const stockRes = await fetch('/api/products/by-ids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [productId] })
          });
          
          if (!stockRes.ok) {
            toast.error('Не удалось проверить наличие');
            return;
          }
          
          const products = await stockRes.json();
          const product = products[0];
          
          if (!product) {
            toast.error('Товар не найден');
            return;
          }
          
          if (product.stock < quantity) {
            toast.error(`Товара "${product.name}" нет в нужном количестве. Осталось: ${product.stock}`);
            return;
          }
          
          if (product.isArchived) {
            toast.error('Этот товар больше не доступен');
            return;
          }
        } catch (error) {
          console.error('Ошибка проверки stock:', error);
          toast.error('Ошибка при проверке наличия');
          return;
        }

        // 2. Добавляем в локальный стор (optimistic update)
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

        // 3. Синхронизируем с сервером
        const { items } = get();
        
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
          });
          
          if (!res.ok) {
            const error = await res.json();
            // Если сервер вернул ошибку — откатываем локальное состояние
            console.error('❌ Server error:', error);
            toast.error(error.error || 'Ошибка синхронизации корзины');
            
            // Перезагружаем корзину с сервера
            const cartRes = await fetch('/api/cart');
            if (cartRes.ok) {
              const serverItems = await cartRes.json();
              set({ items: serverItems });
            }
            return;
          }
          
          toast.success('Товар добавлен в корзину');
        } catch (error) {
          console.error('❌ Ошибка синхронизации корзины:', error);
          toast.error('Ошибка синхронизации корзины');
          
          // Откатываем — перезагружаем с сервера
          const cartRes = await fetch('/api/cart');
          if (cartRes.ok) {
            const serverItems = await cartRes.json();
            set({ items: serverItems });
          }
        }
      },

      removeItem: async (id) => {
        // Удаляем локально
        set((state) => ({
          items: state.items.filter(i => i.id !== id)
        }));
        
        // Синхронизируем с сервером
        const { items } = get();
        
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
          });
          
          if (!res.ok) {
            const error = await res.json();
            console.error('❌ Server error:', error);
            toast.error(error.error || 'Ошибка синхронизации');
            
            // Перезагружаем корзину
            const cartRes = await fetch('/api/cart');
            if (cartRes.ok) {
              const serverItems = await cartRes.json();
              set({ items: serverItems });
            }
          }
        } catch (error) {
          console.error('❌ Ошибка синхронизации:', error);
          toast.error('Ошибка синхронизации');
          
          // Откатываем
          const cartRes = await fetch('/api/cart');
          if (cartRes.ok) {
            const serverItems = await cartRes.json();
            set({ items: serverItems });
          }
        }
      },

      updateQuantity: async (id, quantity) => {
        if (quantity < 1) {
          await get().removeItem(id);
          return;
        }
        
        // Обновляем локально
        set((state) => ({
          items: state.items.map(i =>
            i.id === id ? { ...i, quantity } : i
          )
        }));
        
        // Синхронизируем с сервером
        const { items } = get();
        
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
          });
          
          if (!res.ok) {
            const error = await res.json();
            console.error('❌ Server error:', error);
            toast.error(error.error || 'Ошибка синхронизации');
            
            // Перезагружаем корзину
            const cartRes = await fetch('/api/cart');
            if (cartRes.ok) {
              const serverItems = await cartRes.json();
              set({ items: serverItems });
            }
          }
        } catch (error) {
          console.error('❌ Ошибка синхронизации:', error);
          toast.error('Ошибка синхронизации');
          
          // Откатываем
          const cartRes = await fetch('/api/cart');
          if (cartRes.ok) {
            const serverItems = await cartRes.json();
            set({ items: serverItems });
          }
        }
      },

      clearCart: async () => {
        // Очищаем локально
        set({ items: [] });
        
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [] })
          });
          
          if (!res.ok) {
            console.error('❌ Failed to clear cart on server');
          }
        } catch (error) {
          console.error('❌ Ошибка очистки корзины:', error);
        }
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