// src/components/features/skeleton/CartSkeleton.tsx
import ProductCardSkeleton from './ProductCardSkeleton';

const CartSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 bg-gray-200 rounded w-32 mb-8 animate-pulse"></div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Список товаров */}
        <div className="flex-1 space-y-4">
          {[...Array(3)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
        
        {/* Итоговая сумма */}
        <div className="lg:w-80 w-full">
          <div className="bg-(--bg) p-6 rounded-lg border border-(--border) animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="border-t pt-2 mt-2">
                <div className="h-6 bg-gray-200 rounded w-32 ml-auto"></div>
              </div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-full mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartSkeleton;