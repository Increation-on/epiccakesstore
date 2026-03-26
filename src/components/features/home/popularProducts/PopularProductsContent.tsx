'use client'

import { useEffect, useRef } from 'react'
import ProductCard from '../../products/ProductCard'
import { Product } from '@/types/domain/product.types'

interface Props {
  products: Product[]
}

export default function PopularProductsContent({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current && products.length > 1) {
        const container = scrollRef.current
        const cards = container.querySelectorAll('.snap-center') as NodeListOf<HTMLElement>
        
        // Берем второй товар (индекс 1) для центрирования
        const targetCard = cards[1]
        
        if (targetCard) {
          const containerWidth = container.clientWidth
          const cardWidth = targetCard.offsetWidth
          const cardLeft = targetCard.offsetLeft
          
          // Рассчитываем позицию, чтобы второй товар оказался по центру
          const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2)
          
          container.scrollTo({ left: scrollPosition, behavior: 'instant' })
        }
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [products])

  return (
    <>
      {/* Мобилка — горизонтальный скролл с центрированием */}
      <div className="lg:hidden w-screen relative left-1/2 right-1/2 -mx-[50vw]">
        <div 
          ref={scrollRef}
          className="overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          <div className="flex gap-6 px-4">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="w-70 shrink-0 snap-center"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Десктоп — обычная сетка */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  )
}