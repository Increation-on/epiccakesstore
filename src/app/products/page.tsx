// app/products/page.tsx
import { Suspense } from 'react';
import ProductsContent from '@/components/features/products/ProductsContent';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Каталог тортов | EpicCakesStore',
  description: 'Широкий выбор тортов на любой вкус. Свадебные, детские, праздничные. Закажите торт с доставкой.',
  openGraph: {
    title: 'Каталог тортов | EpicCakesStore',
    description: 'Выберите идеальный торт для вашего праздника. Доставка по городу.',
    images: [{ url: '/logo.jpeg', width: 800, height: 800, alt: 'EpicCakes' }],
    type: 'website',
  },
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4">Загрузка каталога...</div>}>
      <ProductsContent />
    </Suspense>
  );
}