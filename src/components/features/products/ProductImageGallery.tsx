'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [mainImage, setMainImage] = useState<string>(images[0] || '')
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const currentIndex = images.indexOf(mainImage)

  // Обработка свайпа
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const threshold = 50
    if (touchStartX.current - touchEndX.current > threshold) {
      // Свайп влево → следующее изображение
      const nextIndex = Math.min(currentIndex + 1, images.length - 1)
      if (nextIndex !== currentIndex) setMainImage(images[nextIndex])
    } else if (touchEndX.current - touchStartX.current > threshold) {
      // Свайп вправо ← предыдущее изображение
      const prevIndex = Math.max(currentIndex - 1, 0)
      if (prevIndex !== currentIndex) setMainImage(images[prevIndex])
    }
    touchStartX.current = 0
    touchEndX.current = 0
  }

  // Клавиатурная навигация
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        const prevIndex = Math.max(currentIndex - 1, 0)
        setMainImage(images[prevIndex])
      }
      if (e.key === 'ArrowRight') {
        const nextIndex = Math.min(currentIndex + 1, images.length - 1)
        setMainImage(images[nextIndex])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentIndex, images, setMainImage])

  // Навигационные кнопки
  const showNav = images.length > 1

  const goToPrev = () => {
    const prevIndex = Math.max(currentIndex - 1, 0)
    setMainImage(images[prevIndex])
  }

  const goToNext = () => {
    const nextIndex = Math.min(currentIndex + 1, images.length - 1)
    setMainImage(images[nextIndex])
  }

  if (!images.length || !mainImage) {
    return (
      <div className="bg-(--mint) rounded-lg overflow-hidden">
        <div className="relative w-full aspect-square flex flex-col items-center justify-center text-center p-6">
          <span className="text-6xl text-(--text-muted)">🍰</span>
          <p className="text-(--text-muted) text-sm mt-2">Изображений пока нет</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Главное изображение с плавной анимацией */}
      <div className="relative">
        <div
          className="bg-(--mint) rounded-lg overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          aria-label="Галерея изображений"
          role="region"
        >
          <div className="relative w-full aspect-square">
            <div
              key={mainImage}
              className="absolute inset-0 opacity-0 animate-fadeIn"
              style={{ animationDuration: '300ms' }}
            >
              <Image
                src={mainImage}
                alt={`${productName} — изображение ${currentIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>


          {/* Умная подсказка свайпа: > если можно вперёд, < если на последнем (и не первом) */}
          {showNav && (
            <>
              {currentIndex < images.length - 1 ? (
                <div className="md:hidden absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded animate-pulse">
                  {'>'}
                </div>
              ) : currentIndex > 0 ? (
                <div className="md:hidden absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded animate-pulse">
                  {'<'}
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Стрелки-навигация (только десктоп) */}
        {showNav && (
          <>
            {currentIndex > 0 && (
              <button
                onClick={goToPrev}
                aria-label="Предыдущее изображение"
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 border-2 border-(--mint) bg-black/20 hover:bg-black/30 text-white rounded-full shadow-sm items-center justify-center transition"

              >
                {'<'}
              </button>
            )}
            {currentIndex < images.length - 1 && (
              <button
                onClick={goToNext}
                aria-label="Следующее изображение"
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 border-2 border-(--mint) bg-black/20 hover:bg-black/30 text-white rounded-full shadow-sm items-center justify-center transition"

              >
                {'>'}
              </button>
            )}
          </>
        )}
      </div>
      {/* Индикатор позиции (только мобильная версия) */}
      {showNav && (
        <div className="flex justify-center mt-1">
          <span className="text-xs text-(--text-muted)">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}
      {/* Миниатюры с плавной анимацией и масштабированием */}
      {showNav && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1 mt-2 pt-1">
          {images.map((url, index) => (
            <button
              key={url}
              onClick={() => setMainImage(url)}
              aria-label={`Показать изображение ${index + 1}`}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${mainImage === url
                  ? 'border-2 border-(--pink) scale-105'
                  : 'border-2 border-transparent hover:border-(--mint-dark) hover:scale-102'
                }`}
            >
              <Image
                src={url}
                alt={`${productName} — миниатюра ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}


    </div>
  )
}
