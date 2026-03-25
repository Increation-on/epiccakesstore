// app/products/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/features/products/ProductCard';
import { ReviewForm } from '@/components/features/reviews/ReviewForm';
import { ReviewList } from '@/components/features/reviews/ReviewList';
import { AddToCartButton } from '@/components/features/products/AddToCartButton';
import Image from 'next/image';
import type { Metadata } from 'next'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: { categories: true }
  })

  if (!product) {
    return {
      title: 'Товар не найден | EpicCakes',
      description: 'Запрашиваемый товар не существует.',
    }
  }

  const imageUrl = product.images
    ? (typeof product.images === 'string' ? JSON.parse(product.images)[0] : product.images[0])
    : '/logo.jpeg'

  return {
    title: `${product.name} | EpicCakes`,
    description: product.description || `Купить ${product.name} с доставкой. Натуральные ингредиенты.`,
    openGraph: {
      title: product.name,
      description: product.description || `Купить ${product.name} с доставкой`,
      images: [{ url: imageUrl, width: 800, height: 800, alt: product.name }],
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { categories: true }
  });

  if (!product) {
    notFound();
  }

  const reviewCount = await prisma.review.count({
    where: {
      productId: id,
      status: 'approved',
    },
  })

  const categoryId = product.categories[0]?.id;

  const similarProducts = categoryId ? await prisma.product.findMany({
    where: {
      categories: {
        some: { id: categoryId }
      },
      NOT: { id: product.id }
    },
    take: 3,
    include: { categories: true }
  }) : [];

  const images = JSON.parse(product.images as string || '[]');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Основная информация */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Фото */}
        <div className="bg-(--mint) rounded-lg overflow-hidden">
          {images[0] ? (
            <div className="relative w-full h-125 md:h-150">  {/* ← УВЕЛИЧИЛ ВЫСОТУ */}
              <Image
                src={images[0]}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
            </div>
          ) : (
            <div className="h-125 md:h-150 flex items-center justify-center">
              <span className="text-6xl text-(--text-muted)">🍰</span>
            </div>
          )}
        </div>

        {/* Информация */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-(--text) mb-4 font-serif">
            {product.name}
          </h1>

          {/* Рейтинг */}
          {reviewCount > 0 ? (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-xl">
                    {star <= Math.round(product.averageRating) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="text-sm text-(--text-muted)">
                {product.averageRating?.toFixed(1) ?? '0.0'} · {reviewCount} {reviewCount === 1 ? 'отзыв' : 'отзывов'}
              </span>
            </div>
          ) : (
            <div className="text-sm text-(--text-muted) mb-4">
              Нет отзывов
            </div>
          )}

          {/* Цена и наличие */}
          <div className="mb-4">
            <span className="text-3xl font-bold text-(--pink)">
              {product.price} ₽
            </span>
            {!product.inStock && (
              <span className="ml-4 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                Нет в наличии
              </span>
            )}
          </div>

          {/* Описание */}
          <p className="text-(--text-muted) mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Категории */}
          {product.categories.length > 0 && (
            <div className="mb-6">
              <span className="text-sm text-(--text-muted)">Категория:</span>
              <div className="flex gap-2 mt-1">
                {product.categories.map(cat => (
                  <span
                    key={cat.id}
                    className="px-3 py-1 bg-(--mint) rounded-full text-sm text-(--text)"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Кнопка добавления в корзину */}
          <AddToCartButton productId={product.id} inStock={product.inStock} />
        </div>
      </div>

      {/* Похожие товары */}
      {similarProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-(--text) mb-6 font-serif">
            Похожие товары
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Отзывы */}
      <div className="mt-12">
        <div className='mb-4'>
          <ReviewList productId={product.id} />
        </div>
        <ReviewForm productId={product.id} />
      </div>
    </div>
  );
}