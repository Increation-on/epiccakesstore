// src/components/features/home/PopularProducts.tsx
import { prisma } from '@/lib/prisma';
import ProductCard from '../products/ProductCard';

async function getPopularProducts() {
  const products = await prisma.product.findMany({
    take: 4,
    orderBy: { averageRating: 'desc' },
    include: { categories: true }
  });
  return products;
}

export default async function PopularProducts() {
  const products = await getPopularProducts();

  if (products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-(--text)">Популярное</h2>
        
        {/* Только мобилка — горизонтальный скролл */}
        <div className="lg:hidden w-screen relative left-1/2 right-1/2 -mx-[50vw] ">
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-6 px-4">
              {products.map((product) => (
                <div key={product.id} className="w-70 shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Десктоп — обычная сетка */}
        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}