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

  const validateAndUpload = async (file: File) => {
    // 1. Проверка типа файла
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Поддерживаются только JPG, PNG, WebP')
      return false
    }

    // 2. Проверка размера файла (2 MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 2 МБ')
      return false
    }

    // 3. Проверка размеров изображения
    return new Promise<boolean>((resolve) => {
      const img = typeof window !== 'undefined' ? new window.Image() : null
      if (!img) return
      const url = URL.createObjectURL(file)

      img.onload = async () => {
        URL.revokeObjectURL(url)

        const isSquare = Math.abs(img.width - img.height) < 50
        const isLargeEnough = img.width >= 800 && img.height >= 800

        if (!isSquare || !isLargeEnough) {
          const warnings = []
          if (!isSquare) warnings.push('изображение не квадратное')
          if (!isLargeEnough) warnings.push(`размер ${img.width}×${img.height} меньше рекомендуемого 800×800`)

          const confirmUpload = window.confirm(
            `⚠️ Предупреждение: ${warnings.join(', ')}.\n\nРекомендуем загружать квадратные изображения 800×800px.\n\nЗагрузить на свой страх и риск?`
          )

          resolve(confirmUpload)
        } else {
          resolve(true)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        toast.error('Не удалось прочитать изображение')
        resolve(false)
      }

      img.src = url
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isValid = await validateAndUpload(file)
    if (!isValid) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

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

            {/* Кнопки управления */}
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

        {/* Индикатор загрузки во время аплоада */}
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

      {/* Рекомендации */}
      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-800 mb-2">
          📸 <strong>Технические рекомендации для изображений</strong>
        </p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
          <li><strong>Пропорции:</strong> <strong>квадратные (1:1)</strong> — иначе при загрузке будет предупреждение</li>
          <li><strong>Размер:</strong> минимум <strong>800×800px</strong> — иначе будет предупреждение</li>
          <li><strong>Вес:</strong> до <strong>5 МБ</strong> (при несоответствии загрузка будет отклонена)</li>
          <li><strong>Формат:</strong> JPG, PNG, WebP</li>
          <li>При несоответствии рекомендациям вы увидите предупреждение, но сможете загрузить на свой риск</li>
        </ul>
      </div>
    </div>
  )
}