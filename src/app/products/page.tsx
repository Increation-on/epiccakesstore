// app/products/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/domain/product.types';
import { Category } from '@/types/domain/categoery.types';
import ProductCard from '@/components/features/ProductCard';
import CategorySidebar from '@/components/features/CategorySideBar';
import Pagination from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { useDebounce } from 'use-debounce';
import ProductSort from '@/components/features/ProductSort';
import { SortOption } from '@/components/features/ProductSort';
import PriceFilter from '@/components/features/PriceFilter';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ClearFilters from '@/components/features/ClearFilters';
import EmptyState from '@/components/features/EmptyState';
import CatalogSkeleton from '@/components/features/skeleton/CatalogSkeleton';

type ProductsResponse = {
    products: Product[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
};

export default function ProductsPage() {
    const [data, setData] = useState<ProductsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sort, setSort] = useState<SortOption>('newest')
    const [minPrice, setMinPrice] = useState<number>();
    const [maxPrice, setMaxPrice] = useState<number>();
    const [inStockOnly, setInStockOnly] = useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // При монтировании читаем фильтры из URL
    useEffect(() => {
        const pageFromUrl = Number(searchParams.get('page')) || 1;
        const sortFromUrl = searchParams.get('sort') as SortOption || 'newest';
        const searchFromUrl = searchParams.get('search') || '';
        const categoryFromUrl = searchParams.get('category');
        const minPriceFromUrl = searchParams.get('minPrice');
        const maxPriceFromUrl = searchParams.get('maxPrice');
        const inStockFromUrl = searchParams.get('inStock') === 'true';

        setPage(pageFromUrl);
        setSort(sortFromUrl);
        setSearch(searchFromUrl);
        setSelectedCategory(categoryFromUrl);
        setMinPrice(minPriceFromUrl ? Number(minPriceFromUrl) : undefined);
        setMaxPrice(maxPriceFromUrl ? Number(maxPriceFromUrl) : undefined);
        setInStockOnly(inStockFromUrl);
    }, []); // только при загрузке

    useEffect(() => {
        const params = new URLSearchParams();
        if (page !== 1) params.set('page', String(page));
        if (sort !== 'newest') params.set('sort', sort);
        if (search) params.set('search', search);
        if (selectedCategory) params.set('category', selectedCategory);
        if (minPrice) params.set('minPrice', String(minPrice));
        if (maxPrice) params.set('maxPrice', String(maxPrice));
        if (inStockOnly) params.set('inStock', 'true');

        const queryString = params.toString();
        const url = queryString ? `${pathname}?${queryString}` : pathname;

        router.push(url, { scroll: false }); // обновляем URL без перезагрузки
    }, [page, sort, search, selectedCategory, minPrice, maxPrice, inStockOnly]);


    // Загружаем категории
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

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                sort,
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(selectedCategory && { category: String(selectedCategory) }),
                ...(minPrice && { minPrice: String(minPrice) }),
                ...(maxPrice && { maxPrice: String(maxPrice) }),
                ...(inStockOnly && { inStock: 'true' })
            });

            const res = await fetch(`/api/products?${params}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setData(data);
        } catch (err) {
            setError('Ошибка при загрузке товаров');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, selectedCategory, sort, minPrice, maxPrice, inStockOnly]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Сбрасываем на первую страницу при изменении фильтров
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, selectedCategory, sort, inStockOnly]);

    const handlePriceApply = (min?: number, max?: number) => {
        setMinPrice(min);
        setMaxPrice(max);
    };

    const hasActiveFilters = Boolean(
        search ||
        selectedCategory ||
        minPrice ||
        maxPrice ||
        inStockOnly ||
        sort !== 'newest'
    );

    const handleClearFilters = () => {
        setSearch('');
        setSelectedCategory(null);
        setMinPrice(undefined);
        setMaxPrice(undefined);
        setInStockOnly(false);
        setSort('newest');
        setPage(1);

        // Очищаем URL (опционально, useEffect сделает это автоматически)
    };

    // Вместо проверки loading
    if (loading || !data) {
          return <CatalogSkeleton />;  
    }

    if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
    if (!data) return null;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Каталог товаров</h1>

            <div className="flex gap-6">
                <div className="w-64 shrink-0">
                    {/* Сайдбар с категориями */}
                    <CategorySidebar
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />

                    {/* Фильтр по цене */}
                    <PriceFilter
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        onApply={handlePriceApply}
                    />

                    <div className="mt-4 p-4 border rounded-lg bg-gray-50 text-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={inStockOnly}
                                onChange={(e) => setInStockOnly(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">Только в наличии</span>
                        </label>
                    </div>
                </div>
                {/* Основной контент */}
                <div className="flex-1">
                    {/* Строка поиска */}
                    <div className="mb-6">
                        <Input
                            type="text"
                            placeholder="Поиск товаров..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    {/* Кнопка сброса */}
                    <ClearFilters
                        hasFilters={hasActiveFilters}
                        onClear={handleClearFilters}
                    />
                    {/* Сортировка */}
                    <ProductSort value={sort} onChange={setSort} />
                    {/* Количество найденных товаров */}
                    {search && (
                        <p className="mb-4 text-gray-600">
                            Найдено товаров: {data.totalCount}
                        </p>
                    )}

                    {/* Сетка товаров */}
                    {data.products.length === 0 ? (
                        <EmptyState onClear={handleClearFilters} />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            {/* Пагинация */}
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