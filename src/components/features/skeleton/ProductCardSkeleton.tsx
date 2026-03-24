// src/components/features/skeleton/ProductCardSkeleton.tsx
const ProductCardSkeleton = () => {
  return (
    <div className="border rounded-lg p-4 shadow-sm animate-pulse">
      {/* Изображение */}
      <div className="bg-gray-200 h-40 sm:h-48 mb-4 rounded"></div>
      
      {/* Название */}
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      
      {/* Описание — две строки */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      
      {/* Цена */}
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    </div>
  );
}

export default ProductCardSkeleton;