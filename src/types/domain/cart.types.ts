// types/domain/cart.types.ts
import { Product } from "./product.types";

export interface CartItem {
  id: string;              // UUID позиции (свой)
  productId: Product['id'];  // ID товара из Product
  quantity: number;
  addedAt: string;
}

export interface CartStore {
  items: CartItem[];
  
  addItem: (productId: Product['id'], quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  
  // Просто количество товаров (считаем из items)
  totalItems: number;
}