// src/components/features/skeleton/CheckoutSkeleton.tsx
const CheckoutSkeleton = () => {
  return (
    <div className="container mx-auto p-4 max-w-2xl animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
      
      {/* Скелетон заказа */}
      <div className="mb-6 border rounded-lg p-4 bg-gray-50">
        <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex justify-between py-2 border-b">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
        <div className="flex justify-between mt-2 pt-2 border-t">
          <div className="h-5 bg-gray-200 rounded w-16"></div>
          <div className="h-5 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      
      {/* Скелетон формы */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
        <div className="flex gap-4 pt-4">
          <div className="h-12 bg-gray-200 rounded-lg w-32"></div>
          <div className="h-12 bg-gray-200 rounded-lg w-32"></div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSkeleton