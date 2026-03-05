// src/components/features/SearchSkeleton.tsx
const SearchSkeleton = () => {
  return (
    <>
      <div className="mb-6">
        <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
    </>
  );
}
export default SearchSkeleton