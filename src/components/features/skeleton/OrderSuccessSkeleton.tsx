// src/components/features/skeleton/OrderSuccessSkeleton.tsx
const OrderSuccessSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-2xl text-center animate-pulse">
      <div className="rounded-lg p-6 md:p-8 border border-(--border) bg-white shadow-sm">
        {/* Заголовок */}
        <div className="h-8 md:h-10 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
        
        {/* Текст "Номер вашего заказа" */}
        <div className="h-5 bg-gray-200 rounded w-40 mx-auto mb-2"></div>
        
        {/* Номер заказа */}
        <div className="h-10 md:h-12 bg-gray-200 rounded w-64 mx-auto mb-6"></div>
        
        {/* Описание */}
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-56 mx-auto"></div>
        </div>
        
        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div className="h-12 bg-gray-200 rounded w-32 sm:w-auto mx-auto"></div>
          <div className="h-12 bg-gray-200 rounded w-32 sm:w-auto mx-auto"></div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessSkeleton