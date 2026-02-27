import { WithId, Timestamp } from '../core';

// ---------- БАЗОВЫЙ ТИП (то, что в БД) ----------
export type Product = WithId & Timestamp & {
  name: string;
  description: string;
  price: number;
  imageUrls: string[];        // массив фото
  categoryId: number;
  stockQuantity: number;       // реальное количество на складе
  createdAt: Date;
  updatedAt: Date;
};

// ---------- ДЛЯ ПОЛЬЗОВАТЕЛЯ (клиент) ----------
export type ProductResponse = Omit<Product, 'stockQuantity'> & {
  inStock: boolean;  // вычисляемое поле: stockQuantity > 0
};

// ---------- ДЛЯ АДМИНА ----------
export type ProductAdminResponse = Product & {
  // можно добавить служебные поля, если нужно
  lowStock: boolean;  // например, мало осталось
};

// ---------- ДЛЯ СОЗДАНИЯ ----------
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

// ---------- ДЛЯ ОБНОВЛЕНИЯ ----------
export type UpdateProductInput = Partial<CreateProductInput>;

// ---------- ДЛЯ ФИЛЬТРАЦИИ (опционально) ----------
export type ProductFilters = {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
};