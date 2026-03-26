export function ConfirmPageSkeleton() {
  return (
    <div className="container mx-auto p-4 max-w-2xl animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
      
      {/* Скелетон данных доставки */}
      <div className="mb-6 border rounded-lg p-4 bg-gray-50">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 rounded w-48"></div>
          <div className="h-5 bg-gray-200 rounded w-64"></div>
          <div className="h-5 bg-gray-200 rounded w-40"></div>
          <div className="h-5 bg-gray-200 rounded w-56"></div>
          <div className="h-5 bg-gray-200 rounded w-36"></div>
        </div>
      </div>
      
      {/* Скелетон состава заказа */}
      <div className="mb-6 border rounded-lg p-4 bg-gray-50">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-5 bg-gray-200 rounded w-40"></div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-5 bg-gray-200 rounded w-36"></div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="flex justify-between mt-4 pt-2 border-t">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      
      {/* Скелетон кнопки */}
      <div className="h-12 bg-gray-200 rounded w-full"></div>
    </div>
  )
}