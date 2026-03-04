// app/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/domain/product.types';
import ProductCard from '@/components/features/ProductCard';
import { Button } from '@/components/ui/Button';

type ProductsResponse = {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
};

export default function ProductsPage() {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?page=${page}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setData(data);
      } catch (err) {
        setError('Ошибка при загрузке товаров');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [page]); // перезагружаем при смене страницы

  if (loading && !data) return <div className="container mx-auto p-4">Загрузка...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Каталог товаров</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Пагинация */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            size="sm"
            className='text-amber-200'
          >
            Назад
          </Button>
          
          <span className="px-4 py-2">
            {page} из {data.totalPages}
          </span>
          
          <Button
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            size="sm"
            className='text-amber-200'
          >
            Вперёд
          </Button>
        </div>
      )}
    </div>
  );
}