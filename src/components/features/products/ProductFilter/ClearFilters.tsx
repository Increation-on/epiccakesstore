// src/components/features/products/ProductFilter/ClearFilters.tsx
'use client';

import { Button } from "@/components/ui/Button";

type ClearFiltersProps = {
  hasFilters: boolean;
  onClear: () => void;
};

export default function ClearFilters({ hasFilters, onClear }: ClearFiltersProps) {
  if (!hasFilters) return null;

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClear}
      className="mb-4 text-(--pink) border-(--pink) hover:bg-(--pink) hover:text-(--text)"
    >
      ✖ Сбросить все фильтры
    </Button>
  );
}