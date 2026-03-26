'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchResult {
  id: string
  name: string
  price: number
  image: string | null
}

export default function ProductSearchInput() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Поиск при изменении запроса
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        searchProducts(query)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const searchProducts = async (searchQuery: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
      setIsOpen(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (productId: string) => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    router.push(`/products/${productId}`)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск товаров..."
          className="w-full pl-10 pr-4 py-2 border border-(--border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--pink) focus:border-transparent bg-white"
        />
      </div>

      {/* Выпадающий список результатов */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-(--border) z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Загрузка...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Ничего не найдено</div>
          ) : (
            results.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSelect(product.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b last:border-b-0 text-left"
              >
                {/* Картинка */}
                <div className="w-12 h-12 bg-(--mint) rounded-lg flex items-center justify-center shrink-0">
                  {product.image ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <span className="text-2xl">🍰</span>
                  )}
                </div>

                {/* Информация */}
                <div className="flex-1">
                  <div className="font-semibold text-(--text) line-clamp-1">
                    {product.name}
                  </div>
                  <div className="text-sm text-(--pink) font-bold">
                    {product.price} ₽
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}