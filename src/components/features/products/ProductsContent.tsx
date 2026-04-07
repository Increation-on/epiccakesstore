'use client'

import { useState, useEffect, useRef } from 'react';
import { Product } from '@/types/domain/product.types';
import { Category } from '@/types/domain/categoery.types';
import ProductCard from '@/components/features/products/ProductCard';
import CategorySidebar from '@/components/features/products/ProductFilter/CategorySideBar';
import Pagination from '@/components/ui/Pagination';
import ProductSort from '@/components/features/products/ProductSort';
import { SortOption } from '@/components/features/products/ProductSort';
import PriceFilter from '@/components/features/products/ProductFilter/PriceFilter';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ClearFilters from '@/components/features/products/ProductFilter/ClearFilters';
import EmptyState from '@/components/features/products/ProductFilter/EmptyProductsFilter';
import CatalogSkeleton from '@/components/features/skeleton/CatalogSkeleton';
import ProductSearchInput from './search/ProductsSearchInput';
import { useProductsStore } from '@/store/products.store';

export default function ProductsContent() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sort, setSort] = useState<SortOption>('newest')
    const [minPrice, setMinPrice] = useState<number>();
    const [maxPrice, setMaxPrice] = useState<number>();
    const [inStockOnly, setInStockOnly] = useState(false);

    const { data, isLoading, error, fetchProducts, setData, clearCache } = useProductsStore();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const productsContainerRef = useRef<HTMLDivElement>(null);
    
    const page = Number(searchParams.get('page')) || 1;

    // Отключаем авто-восстановление скролла браузера
    useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual'
        }
        return () => {
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'auto'
            }
        }
    }, [])

    // Читаем остальные параметры из URL при монтировании
    useEffect(() => {
        const sortFromUrl = searchParams.get('sort') as SortOption || 'newest';
        const categoryFromUrl = searchParams.get('category');
        const minPriceFromUrl = searchParams.get('minPrice');
        const maxPriceFromUrl = searchParams.get('maxPrice');
        const inStockFromUrl = searchParams.get('inStock') === 'true';

        setSort(sortFromUrl);
        setSelectedCategory(categoryFromUrl);
        setMinPrice(minPriceFromUrl ? Number(minPriceFromUrl) : undefined);
        setMaxPrice(maxPriceFromUrl ? Number(maxPriceFromUrl) : undefined);
        setInStockOnly(inStockFromUrl);
    }, []);

    // Обновляем URL при изменении параметров
    useEffect(() => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        if (sort !== 'newest') params.set('sort', sort);
        if (selectedCategory) params.set('category', selectedCategory);
        if (minPrice) params.set('minPrice', String(minPrice));
        if (maxPrice) params.set('maxPrice', String(maxPrice));
        if (inStockOnly) params.set('inStock', 'true');

        const queryString = params.toString();
        const url = `${pathname}?${queryString}`;
        router.push(url, { scroll: false });
    }, [page, sort, selectedCategory, minPrice, maxPrice, inStockOnly]);

    // Загрузка категорий
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('/api/categories');
                if (!res.ok) throw new Error('Failed to fetch categories');
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error('Error loading categories:', err);
            }
        }
        fetchCategories();
    }, []);

    // Загрузка товаров
    useEffect(() => {
        const params = new URLSearchParams({
            page: String(page),
            sort,
            ...(selectedCategory && { category: String(selectedCategory) }),
            ...(minPrice && { minPrice: String(minPrice) }),
            ...(maxPrice && { maxPrice: String(maxPrice) }),
            ...(inStockOnly && { inStock: 'true' })
        });

        fetchProducts(params);
    }, [page, selectedCategory, sort, minPrice, maxPrice, inStockOnly, fetchProducts]);

    const handleFilterChange = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        
        setTimeout(() => {
            productsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
    };

    const handlePriceApply = (min?: number, max?: number) => {
        setMinPrice(min);
        setMaxPrice(max);
        handleFilterChange();
    };

    const handleCategorySelect = (category: string | null) => {
        setSelectedCategory(category);
        handleFilterChange();
    };

    const handleSortChange = (newSort: SortOption) => {
        setSort(newSort);
        handleFilterChange();
    };

    const handleInStockChange = (checked: boolean) => {
        setInStockOnly(checked);
        handleFilterChange();
    };

    const hasActiveFilters = Boolean(
        selectedCategory ||
        minPrice ||
        maxPrice ||
        inStockOnly ||
        sort !== 'newest'
    );

    const handleClearFilters = () => {
        setSelectedCategory(null);
        setMinPrice(undefined);
        setMaxPrice(undefined);
        setInStockOnly(false);
        setSort('newest');
        clearCache();
        setData(null);
        router.push(pathname, { scroll: false });
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(newPage));
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        
        // Скроллим к контейнеру товаров
        setTimeout(() => {
            productsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
    };

    if ((!data && isLoading) || (!data && !isLoading && !error)) {
        return <CatalogSkeleton />;
    }

    if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
    if (!data) return null;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-(--text) font-serif">
                Каталог товаров
            </h1>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 shrink-0">
                    <div className='mb-6'>
                        <CategorySidebar
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={handleCategorySelect}
                        />
                    </div>

                    <PriceFilter
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        onApply={handlePriceApply}
                    />

                    <div className="mt-4 p-4 border border-(--border) rounded-lg bg-(--bg)">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={inStockOnly}
                                onChange={(e) => handleInStockChange(e.target.checked)}
                                className="w-4 h-4 accent-(--pink)"
                            />
                            <span className="text-sm text-(--text-muted)">Только в наличии</span>
                        </label>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="mb-6">
                        <ProductSearchInput />
                    </div>

                    <ClearFilters
                        hasFilters={hasActiveFilters}
                        onClear={handleClearFilters}
                    />

                    <ProductSort value={sort} onChange={handleSortChange} />

                    {data.products.length === 0 ? (
                        <EmptyState onClear={handleClearFilters} />
                    ) : (
                        <>
                            <div 
                                ref={productsContainerRef}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {data.products.map((product: Product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            {data.totalPages > 1 && (
                                <Pagination
                                    currentPage={page}
                                    totalPages={data.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}