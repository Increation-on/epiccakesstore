'use client';

import { Button } from '@/components/ui/Button';

type EmptyProductsFilterProps = {
  onClear: () => void;
};

export default function EmptyProductsFilter({ onClear }: EmptyProductsFilterProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
      <p className="text-gray-600 mb-6">
        Попробуйте изменить параметры поиска или сбросить фильтры
      </p>
      <Button onClick={onClear}>
        Сбросить все фильтры
      </Button>
    </div>
  );
}