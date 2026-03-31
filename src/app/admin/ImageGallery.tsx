'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'

interface ImageGalleryProps {
  images: string[]
  onChange: (images: string[]) => void
}

export function ImageGallery({ images, onChange }: ImageGalleryProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Ошибка загрузки')

      const data = await res.json()
      onChange([...images, data.url])
      toast.success('Изображение загружено')
    } catch (error) {
      toast.error('Ошибка при загрузке')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
    toast.success('Изображение удалено')
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newImages = [...images]
      ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
    onChange(newImages)
  }

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return
    const newImages = [...images]
      ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-1">Изображения</label>

      {/* Сетка превью */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={url} className="relative group">
            <div className="relative aspect-square rounded-lg overflow-hidden border border-(--border)">
              <Image
                src={url}
                alt={`Изображение ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>

            {/* Кнопки управления — без изменений */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
              >
                🗑️
              </button>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  className="bg-black/50 text-white p-1 rounded hover:bg-black/70"
                >
                  ↑
                </button>
              )}
              {index < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  className="bg-black/50 text-white p-1 rounded hover:bg-black/70"
                >
                  ↓
                </button>
              )}
            </div>
          </div>
        ))}

        {/* 👇 Индикатор загрузки во время аплоада */}
        {uploading && (
          <div className="aspect-square border-2 border-dashed border-(--pink) rounded-lg flex flex-col items-center justify-center gap-2 bg-(--mint)/20">
            <div className="w-8 h-8 border-4 border-(--pink) border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-(--pink)">Загрузка...</span>
          </div>
        )}

        {/* Кнопка добавления — показываем только если не загружаем */}
        {!uploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-(--border) rounded-lg flex flex-col items-center justify-center gap-2 hover:border-(--pink) transition"
          >
            <span className="text-2xl">+</span>
            <span className="text-xs text-(--text-muted)">Добавить</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      <p className="text-xs text-(--text-muted)">
        Поддерживаются форматы PNG, JPG, WebP. Первое изображение будет основным.
      </p>
    </div>
  )
}