// app/products/page.tsx
import { Suspense } from 'react';
import ProductsContent from '@/components/features/products/ProductsContent';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4">Загрузка каталога...</div>}>
      <ProductsContent />
    </Suspense>
  );
}