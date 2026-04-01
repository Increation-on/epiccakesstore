import { create } from 'zustand'
import { Product } from '@/types/domain/product.types'

type ProductsResponse = {
  products: Product[]
  totalCount: number
  currentPage: number
  totalPages: number
}

interface ProductsStore {
  // Кеш для разных комбинаций фильтров
  cache: Map<string, ProductsResponse>
  // Текущие отображаемые данные
  data: ProductsResponse | null
  isLoading: boolean
  error: string | null
  
  fetchProducts: (params: URLSearchParams) => Promise<ProductsResponse>
  getCacheKey: (params: URLSearchParams) => string
  clearCache: () => void
  setData: (data: ProductsResponse | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const CACHE_TTL = 5 * 60 * 1000 // 5 минут
const cacheTimestamps = new Map<string, number>()

export const useProductsStore = create<ProductsStore>((set, get) => ({
  cache: new Map(),
  data: null,
  isLoading: false,
  error: null,

  getCacheKey: (params: URLSearchParams) => {
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    return sortedParams || 'default'
  },

  fetchProducts: async (params: URLSearchParams) => {
    const cacheKey = get().getCacheKey(params)
    const cached = get().cache.get(cacheKey)
    const cachedTimestamp = cacheTimestamps.get(cacheKey)
    
    // Если есть свежий кеш — возвращаем его
    if (cached && cachedTimestamp && Date.now() - cachedTimestamp < CACHE_TTL) {
      get().setData(cached)
      return cached
    }
    
    // Нет кеша — грузим
    get().setLoading(true)
    
    try {
      const res = await fetch(`/api/products?${params}`)
      if (!res.ok) throw new Error('Ошибка загрузки')
      
      const data: ProductsResponse = await res.json()
      
      // Сохраняем в кеш
      get().cache.set(cacheKey, data)
      cacheTimestamps.set(cacheKey, Date.now())
      
      get().setData(data)
      get().setError(null)
      
      return data
    } catch (error) {
      get().setError(error instanceof Error ? error.message : 'Ошибка загрузки')
      throw error
    } finally {
      get().setLoading(false)
    }
  },

  clearCache: () => {
    set({ cache: new Map() })
    cacheTimestamps.clear()
  },

  setData: (data) => set({ data }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}))