// src/components/features/CategorySidebar.tsx
'use client';

import { Category } from "@/types/domain/categoery.types";

type CategorySidebarProps = {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
};

export default function CategorySidebar({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategorySidebarProps) {
  return (
    <div className="w-64 shrink-0">
      <h2 className="font-semibold mb-3">Категории</h2>
      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-3 py-2 rounded transition-colors ${
            selectedCategory === null 
              ? 'bg-blue-500 text-white' 
              : 'hover:bg-gray-100'
          }`}
        >
          Все товары
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id.toString())}
            className={`w-full text-left px-3 py-2 rounded transition-colors ${
              selectedCategory === category.id 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}