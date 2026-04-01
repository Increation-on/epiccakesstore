// src/types/domain/product.types.ts
import { WithId, Timestamp } from '../core';
import { Category } from './categoery.types';

// ---------- БАЗОВЫЙ ТИП (соответствует Prisma) ----------
export type Product = WithId & Timestamp & {
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string | string[];           // JSON строка из БД
  inStock: boolean;         
  categories?: Category[];
  stock: number;
  isArchived: boolean      // 👈 добавляем
  archivedAt: string | null
};

// ---------- ДЛЯ СОЗДАНИЯ ----------
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

// ---------- ДЛЯ ОБНОВЛЕНИЯ ----------
export type UpdateProductInput = Partial<CreateProductInput>;

// ---------- ДЛЯ ФИЛЬТРАЦИИ ----------
export type ProductFilters = {
  categoryId?: string;     // теперь string (cuid)
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  search?: string;
};