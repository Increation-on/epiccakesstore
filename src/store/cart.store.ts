import { create } from 'zustand';

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (item) => set((state) => {
    // Проверяем, есть ли уже такой товар
    const existing = state.items.find(i => i.id === item.id);
    
    if (existing) {
      // если есть — увеличиваем quantity
      return {
        items: state.items.map(i =>
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        )
      };
    } else {
      // если нет — добавляем с quantity = 1
      return {
        items: [...state.items, { ...item, quantity: 1 }]
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
  
  total: () => {
    const items = get().items;
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}));