import { prisma } from '@/lib/prisma';
import PopularProductsContent from './PopularProductsContent';

async function getPopularProducts() {
  const productsRaw = await prisma.product.findMany({
    where: {
      isArchived: false
    },
    take: 4,
    orderBy: { averageRating: 'desc' },
    include: { categories: true }
  });
  
  // Приводим archivedAt к строке
  const products = productsRaw.map(p => ({
    ...p,
    archivedAt: p.archivedAt ? p.archivedAt.toISOString() : null,
  }));
  
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