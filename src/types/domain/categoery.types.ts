// src/types/domain/categoery.types.ts
import { WithId, Timestamp } from '../core';

export type Category = WithId & Timestamp & {
  name: string;
  description?: string;
};

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateCategoryInput = Partial<CreateCategoryInput>;