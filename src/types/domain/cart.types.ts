// src/types/domain/cart.types.ts
import { Product } from "./product.types";

export interface CartItem {
  id: string;
  productId: Product['id'];
  quantity: number;
  addedAt: string;
}

export interface CartStore {
  items: CartItem[];
  isAuthenticated: boolean;
  
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (newItems: CartItem[]) => void;
  setAuthenticated: (state: boolean) => void;
  readonly totalItems: number;
}