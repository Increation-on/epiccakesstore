import { WithId, Timestamp } from '../core';

export type Category = WithId & Timestamp & {
  name: string;
  slug: string;        // например, 'coffee-mugs'
  description?: string;
};

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & {
    slug?: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;