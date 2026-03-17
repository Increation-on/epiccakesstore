// app/products/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import ProductCard from '@/components/features/ProductCard';
import { ReviewForm } from '@/components/features/ReviewForm';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { categories: true }
  });

  if (!product) {
    notFound();
  }

  // Получаем ID первой категории товара (если есть)
  const categoryId = product.categories[0]?.id;

  // Похожие товары из той же категории
  const similarProducts = categoryId ? await prisma.product.findMany({
    where: {
      categories: {
        some: { id: categoryId }
      },
      NOT: { id: product.id } // исключаем текущий товар
    },
    take: 3, // покажем 3 похожих товара
    include: { categories: true }
  }) : [];

  const images = JSON.parse(product.images as string || '[]');

  return (
    <div className="container mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Фото */}
        <div>
          {images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[0]}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Нет фото</span>
            </div>
          )}
        </div>

        {/* Информация */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="mb-4">
            <span className="text-2xl font-bold text-blue-600">
              {product.price} ₽
            </span>
            {!product.inStock && (
              <span className="ml-4 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                Нет в наличии
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="mb-6">
            <span className="text-sm text-gray-500">Категория:</span>
            <div className="flex gap-2 mt-1">
              {product.categories.map(cat => (
                <span
                  key={cat.id}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            disabled={!product.inStock}
            className="w-full md:w-auto"
          >
            {product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
          </Button>
        </div>
      </div>

      {/* Похожие товары */}
      {similarProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Похожие товары</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
      {/* 🔥 БЛОК ОТЗЫВОВ */}
      <div className="mt-12">
        <ReviewForm productId={product.id} />
      </div>
    </div>
  );
}