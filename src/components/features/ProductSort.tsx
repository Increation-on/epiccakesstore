// src/components/features/ProductSort.tsx
'use client';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

type ProductSortProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

export default function ProductSort({ value, onChange }: ProductSortProps) {
  return (
    <div className="flex items-center gap-2 mb-4 text-gray-900">
      <label htmlFor="sort" className="text-sm text-gray-600">
        Сортировать:
      </label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="border rounded px-3 py-1.5 text-sm bg-white"
      >
        <option value="newest">Сначала новые</option>
        <option value="price_asc">Цена: по возрастанию</option>
        <option value="price_desc">Цена: по убыванию</option>
        <option value="name_asc">По названию</option>
      </select>
    </div>
  );
}