// src/components/features/skeleton/SearchSkeleton.tsx
const SearchSkeleton = () => {
  return (
    <div className="mb-6 space-y-4">
      {/* Поле поиска */}
      <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
      
      {/* Кнопка сброса фильтров */}
      <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
      
      {/* Сортировка */}
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
    </div>
  );
}

export default SearchSkeleton;