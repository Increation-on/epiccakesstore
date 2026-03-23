// src/components/features/skeleton/CatalogSkeleton.tsx
import SidebarSkeleton from './SidebarSkeleton';
import SearchSkeleton from './SearchSkeleton';
import ProductCardSkeleton from './ProductCardSkeleton';

const CatalogSkeleton = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Каталог товаров</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Сайдбар — только на десктопе */}
        <div className="hidden md:block w-64 shrink-0">
          <SidebarSkeleton />
        </div>
        
        <div className="flex-1">
          <SearchSkeleton />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CatalogSkeleton;