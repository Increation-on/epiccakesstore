// src/components/features/ProductCardSkeleton.tsx
const ProductCardSkeleton = () => {
  return (
    <div className="border rounded-lg p-4 shadow-sm animate-pulse">
      <div className="bg-gray-200 h-48 mb-4 rounded"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    </div>
  );
}

export default ProductCardSkeleton