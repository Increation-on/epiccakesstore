'use client'

import { useState, useEffect, useCallback } from 'react';
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

type ProductsResponse = {
    products: Product[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
};

export default function ProductsContent() {
    const [data, setData] = useState<ProductsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sort, setSort] = useState<SortOption>('newest')
    const [minPrice, setMinPrice] = useState<number>();
    const [maxPrice, setMaxPrice] = useState<number>();
    const [inStockOnly, setInStockOnly] = useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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
    }, [page, selectedCategory, sort, minPrice, maxPrice, inStockOnly]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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
    };

    if (loading || !data) {
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
                    {/* 🔥 Поиск — только автокомплит, без фильтрации */}
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
                                {data.products.map((product) => (
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