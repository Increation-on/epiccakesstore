// src/components/features/products/ProductSort.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

type ProductSortProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

const sortLabels: Record<SortOption, string> = {
  newest: 'Сначала новые',
  price_asc: 'Цена: по возрастанию',
  price_desc: 'Цена: по убыванию',
  name_asc: 'По названию',
};

export default function ProductSort({ value, onChange }: ProductSortProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHoveringSort, setIsHoveringSort] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Закрываем при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SortOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full sm:w-auto px-4 py-2 border border-(--border) rounded-lg bg-white text-(--text) transition"
      >
        <span>
          Сортировать:{' '}
          <span 
            className={`px-1 rounded transition ${isHoveringSort ? 'bg-(--mint)' : ''}`}
            onMouseEnter={() => setIsHoveringSort(true)}
            onMouseLeave={() => setIsHoveringSort(false)}
          >
            {sortLabels[value]}
          </span>
        </span>
        <svg 
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          onMouseEnter={() => setIsHoveringSort(true)}
          onMouseLeave={() => setIsHoveringSort(false)}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full sm:w-64 bg-white border border-(--border) rounded-lg shadow-lg z-10">
          {Object.entries(sortLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleSelect(key as SortOption)}
              className={`block w-full text-left px-4 py-2 text-sm transition ${
                value === key
                  ? 'bg-(--pink) text-white'
                  : 'text-(--text) hover:bg-(--mint)'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}