'use client'

import { useState, useEffect } from 'react';
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

type ProductsResponse = {
    products: Product[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
};

export default function ProductsContent() {
    const [page, setPage] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sort, setSort] = useState<SortOption>('newest')
    const [minPrice, setMinPrice] = useState<number>();
    const [maxPrice, setMaxPrice] = useState<number>();
    const [inStockOnly, setInStockOnly] = useState(false);

    // Берем данные из стора
    const { data, isLoading, error, fetchProducts, setData, clearCache } = useProductsStore();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Читаем параметры из URL при монтировании
    useEffect(() => {
        const pageFromUrl = Number(searchParams.get('page')) || 1;
        const sortFromUrl = searchParams.get('sort') as SortOption || 'newest';
        const categoryFromUrl = searchParams.get('category');
        const minPriceFromUrl = searchParams.get('minPrice');
        const maxPriceFromUrl = searchParams.get('maxPrice');
        const inStockFromUrl = searchParams.get('inStock') === 'true';

        setPage(pageFromUrl);
        setSort(sortFromUrl);
        setSelectedCategory(categoryFromUrl);
        setMinPrice(minPriceFromUrl ? Number(minPriceFromUrl) : undefined);
        setMaxPrice(maxPriceFromUrl ? Number(maxPriceFromUrl) : undefined);
        setInStockOnly(inStockFromUrl);
    }, []);

    // Обновляем URL при изменении параметров
    useEffect(() => {
        const params = new URLSearchParams();
        if (page !== 1) params.set('page', String(page));
        if (sort !== 'newest') params.set('sort', sort);
        if (selectedCategory) params.set('category', selectedCategory);
        if (minPrice) params.set('minPrice', String(minPrice));
        if (maxPrice) params.set('maxPrice', String(maxPrice));
        if (inStockOnly) params.set('inStock', 'true');

        const queryString = params.toString();
        const url = queryString ? `${pathname}?${queryString}` : pathname;
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

    // Загрузка товаров при изменении параметров
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

    // Сброс страницы при смене фильтров
    useEffect(() => {
        setPage(1);
    }, [selectedCategory, sort, inStockOnly, minPrice, maxPrice]);

    const handlePriceApply = (min?: number, max?: number) => {
        setMinPrice(min);
        setMaxPrice(max);
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
        setPage(1);
        clearCache();
        setData(null); // сбрасываем данные
    };

    // Показываем скелетон только если нет данных и идет загрузка
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
                            onSelectCategory={setSelectedCategory}
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
                                onChange={(e) => setInStockOnly(e.target.checked)}
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

                    <ProductSort value={sort} onChange={setSort} />

                    {data.products.length === 0 ? (
                        <EmptyState onClear={handleClearFilters} />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.products.map((product: Product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            {data.totalPages > 1 && (
                                <Pagination
                                    currentPage={page}
                                    totalPages={data.totalPages}
                                    onPageChange={setPage}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}