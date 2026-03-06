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
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.id === id ? { ...i, quantity } : i
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      setItems: (newItems) => set({ items: newItems }),
      
      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);