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
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(selectedCategory && { category: String(selectedCategory) })
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
    }, [page, debouncedSearch, selectedCategory]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Сбрасываем на первую страницу при изменении фильтров
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, selectedCategory]);

    if (loading && !data) return <div className="container mx-auto p-4">Загрузка...</div>;
    if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
    if (!data) return null;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Каталог товаров</h1>

            <div className="flex gap-6">
                {/* Сайдбар с категориями */}
                <CategorySidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />

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

                    {/* Количество найденных товаров */}
                    {search && (
                        <p className="mb-4 text-gray-600">
                            Найдено товаров: {data.totalCount}
                        </p>
                    )}

                    {/* Сетка товаров */}
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
                </div>
            </div>
        </div>
    );
}