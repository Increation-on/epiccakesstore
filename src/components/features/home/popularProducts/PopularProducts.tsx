import { prisma } from '@/lib/prisma';
import PopularProductsContent from './PopularProductsContent';

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
        <PopularProductsContent products={products} />
      </div>
    </section>
  );
}