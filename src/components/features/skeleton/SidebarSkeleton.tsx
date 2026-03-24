// src/components/features/skeleton/SidebarSkeleton.tsx
const SidebarSkeleton = () => {
  return (
    <div className="w-64 shrink-0">
      {/* Заголовок "Категории" */}
      <div className="h-7 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
      
      {/* Список категорий */}
      <div className="space-y-2">
        <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        ))}
      </div>
      
      {/* Фильтр цены */}
      <div className="mt-6 p-4 border border-(--border) rounded-lg">
        <div className="h-5 bg-gray-200 rounded w-12 mb-3 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>
      
      {/* Чекбокс "Только в наличии" */}
      <div className="mt-4 p-4 border border-(--border) rounded-lg">
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
    </div>
  );
}

export default SidebarSkeleton;