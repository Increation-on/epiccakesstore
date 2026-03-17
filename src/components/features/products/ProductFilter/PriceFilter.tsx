// src/components/features/PriceFilter.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type PriceFilterProps = {
  minPrice?: number;
  maxPrice?: number;
  onApply: (min?: number, max?: number) => void;
};

export default function PriceFilter({ minPrice, maxPrice, onApply }: PriceFilterProps) {
  const [min, setMin] = useState(minPrice?.toString() || '');
  const [max, setMax] = useState(maxPrice?.toString() || '');

  // Сбрасываем локальное состояние при изменении пропсов
  useEffect(() => {
    setMin(minPrice?.toString() || '');
    setMax(maxPrice?.toString() || '');
  }, [minPrice, maxPrice]);

  const handleApply = () => {
    const minVal = min ? Number(min) : undefined;
    const maxVal = max ? Number(max) : undefined;
    
    if (minVal && maxVal && minVal > maxVal) {
      alert('Минимальная цена не может быть больше максимальной');
      return;
    }
    
    onApply(minVal, maxVal);
  };

  const handleClear = () => {
    setMin('');
    setMax('');
    onApply(undefined, undefined);
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50 text-gray-700">
      <h3 className="font-semibold mb-3">Цена</h3>
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          placeholder="от"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="w-24"
          min={0}
        />
        <span>—</span>
        <Input
          type="number"
          placeholder="до"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="w-24"
          min={0}
        />
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={handleApply}>Применить</Button>
        <Button size="sm" variant="outline" onClick={handleClear}>Сбросить</Button>
      </div>
    </div>
  );
}