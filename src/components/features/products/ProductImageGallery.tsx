'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [mainImage, setMainImage] = useState<string>(images[0] || '')

  if (!images.length || !mainImage) {
    return (
      <div className="bg-(--mint) rounded-lg overflow-hidden">
        <div className="relative w-full aspect-square md:aspect-4/3 flex items-center justify-center">
          <span className="text-6xl text-(--text-muted)">🍰</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Главное изображение */}
      <div className="bg-(--mint) rounded-lg overflow-hidden">
        <div className="relative w-full aspect-square md:aspect-4/3">
          <Image
            src={mainImage}
            alt={productName}
            fill
            className="object-contain"  // 👈 меняем на object-contain
            priority
          />
        </div>
      </div>
      
      {/* Миниатюры */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((url, index) => (
            <button
              key={url}
              onClick={() => setMainImage(url)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                mainImage === url
                  ? 'border-(--pink)'
                  : 'border-transparent hover:border-(--pink)'
              }`}
            >
              <Image
                src={url}
                alt={`${productName} - фото ${index + 1}`}
                fill
                className="object-cover"  // для миниатюр оставляем object-cover
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}