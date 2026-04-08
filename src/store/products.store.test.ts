import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProductsStore } from './products.store';

// Мокаем fetch
global.fetch = vi.fn();

describe('products.store', () => {
  beforeEach(() => {
    // Сбрасываем состояние
    useProductsStore.setState({
      cache: new Map(),
      data: null,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('getCacheKey', () => {
    it('создаёт ключ из параметров', () => {
      const { getCacheKey } = useProductsStore.getState();
      const params = new URLSearchParams({ page: '1', sort: 'newest', category: 'torty' });
      
      const key = getCacheKey(params);
      
      expect(key).toContain('page=1');
      expect(key).toContain('sort=newest');
      expect(key).toContain('category=torty');
    });

    it('возвращает "default" для пустых параметров', () => {
      const { getCacheKey } = useProductsStore.getState();
      const params = new URLSearchParams();
      
      const key = getCacheKey(params);
      
      expect(key).toBe('default');
    });

    it('сортирует параметры для одинакового ключа', () => {
      const { getCacheKey } = useProductsStore.getState();
      const params1 = new URLSearchParams({ page: '1', sort: 'newest' });
      const params2 = new URLSearchParams({ sort: 'newest', page: '1' });
      
      const key1 = getCacheKey(params1);
      const key2 = getCacheKey(params2);
      
      expect(key1).toBe(key2);
    });
  });

  describe('fetchProducts', () => {
    const mockProductsResponse = {
      products: [
        { id: '1', name: 'Торт', price: 500, inStock: true },
      ],
      totalCount: 1,
      currentPage: 1,
      totalPages: 1,
    };

    it('загружает продукты и сохраняет в кеш', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductsResponse,
      });

      const { fetchProducts } = useProductsStore.getState();
      const params = new URLSearchParams({ page: '1' });
      
      const result = await fetchProducts(params);
      
      expect(result).toEqual(mockProductsResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/products?page=1');
      
      const { data, isLoading, error } = useProductsStore.getState();
      expect(data).toEqual(mockProductsResponse);
      expect(isLoading).toBe(false);
      expect(error).toBe(null);
    });

    it('обрабатывает ошибку при загрузке', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      const { fetchProducts } = useProductsStore.getState();
      const params = new URLSearchParams({ page: '1' });
      
      await expect(fetchProducts(params)).rejects.toThrow('Ошибка загрузки');
      
      const { error, isLoading } = useProductsStore.getState();
      expect(error).toBe('Ошибка загрузки');
      expect(isLoading).toBe(false);
    });

    it('использует кеш при повторном запросе', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductsResponse,
      });

      const { fetchProducts } = useProductsStore.getState();
      const params = new URLSearchParams({ page: '1' });
      
      // Первый запрос
      await fetchProducts(params);
      
      // Второй запрос (должен взять из кеша)
      vi.clearAllMocks();
      await fetchProducts(params);
      
      // fetch не должен вызываться второй раз
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('очищает кеш', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ products: [], totalCount: 0, currentPage: 1, totalPages: 1 }),
      });

      const { fetchProducts, clearCache, cache } = useProductsStore.getState();
      const params = new URLSearchParams({ page: '1' });
      
      await fetchProducts(params);
      
      expect(cache.size).toBe(1);
      
      clearCache();
      
      const { cache: newCache } = useProductsStore.getState();
      expect(newCache.size).toBe(0);
    });
  });

  describe('setData', () => {
    it('устанавливает данные', () => {
      const { setData } = useProductsStore.getState();
      const mockData = { products: [], totalCount: 0, currentPage: 1, totalPages: 1 };
      
      setData(mockData);
      
      const { data } = useProductsStore.getState();
      expect(data).toEqual(mockData);
    });
  });

  describe('setLoading', () => {
    it('устанавливает состояние загрузки', () => {
      const { setLoading } = useProductsStore.getState();
      
      setLoading(true);
      expect(useProductsStore.getState().isLoading).toBe(true);
      
      setLoading(false);
      expect(useProductsStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('устанавливает ошибку', () => {
      const { setError } = useProductsStore.getState();
      
      setError('Тестовая ошибка');
      expect(useProductsStore.getState().error).toBe('Тестовая ошибка');
      
      setError(null);
      expect(useProductsStore.getState().error).toBe(null);
    });
  });
});