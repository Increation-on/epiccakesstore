'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types/domain/categoery.types'
import { Product } from '@/types/domain/product.types'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'
import { ImageGallery } from '../../ImageGallery'

type Props = {
  categories: Category[]
  initialData?: Product
  onSuccess: () => void
  onCancel: () => void
  isEditing?: boolean
}

export default function ProductEditForm({
  categories,
  initialData,
  onSuccess,
  onCancel,
  isEditing = false
}: Props) {
  const [loading, setLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    inStock: true,
    stock: 0,
    categoryIds: [] as string[]
  })

  useEffect(() => {
    if (initialData) {
      // Парсим изображения в массив
      let parsedImages: string[] = []
      if (initialData.images) {
        try {
          const images = typeof initialData.images === 'string'
            ? JSON.parse(initialData.images)
            : initialData.images
          parsedImages = Array.isArray(images) ? images : []
        } catch {
          parsedImages = []
        }
      }
      setImageUrls(parsedImages)

      setFormData({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || '',
        price: String(initialData.price),
        inStock: initialData.inStock,
        stock: initialData.stock ?? 0,
        categoryIds: initialData.categories?.map(cat => String(cat.id)) || []
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing && initialData?.id
        ? `/api/admin/products/${String(initialData.id)}`
        : '/api/admin/products'

      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          images: JSON.stringify(imageUrls),
          categoryIds: formData.categoryIds
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(isEditing ? 'Товар обновлен' : 'Товар создан')
        onSuccess()
      } else {
        toast.error(data.error || `Ошибка при ${isEditing ? 'обновлении' : 'создании'} товара`)
      }
    } catch (error) {
      console.error('❌ Ошибка:', error)
      toast.error(`Ошибка при ${isEditing ? 'обновлении' : 'создании'} товара`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {/* Название */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Название <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full focus:outline-none p-2 md:p-3 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) text-sm md:text-base bg-white"
          placeholder="Например: Шоколадный торт"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium mb-1">Slug (если пусто - создастся из названия)</label>
        <input
          type="text"
          value={formData.slug}
          onChange={e => setFormData({ ...formData, slug: e.target.value })}
          className="w-full focus:outline-none p-2 md:p-3 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) text-sm md:text-base bg-white"
          placeholder="shokoladnyy-tort"
        />
        <p className="text-xs text-(--text-muted) mt-1">
          Только латиница, дефисы и цифры
        </p>
      </div>

      {/* Описание */}
      <div>
        <label className="block text-sm font-medium mb-1">Описание</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full focus:outline-none p-2 md:p-3 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) text-sm md:text-base bg-white"
          rows={4}
          placeholder="Подробное описание товара..."
        />
      </div>

      {/* Цена */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Цена <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.price}
          onChange={e => setFormData({ ...formData, price: e.target.value })}
          className="w-full focus:outline-none p-2 md:p-3 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) text-sm md:text-base bg-white"
          placeholder="0.00"
        />
      </div>

      {/* Количество на складе */}
      <div>
        <label htmlFor="stock" className="block text-sm font-medium mb-1">
          Количество на складе
        </label>
        <input
          type="number"
          id="stock"
          min="0"
          step="1"
          value={formData.stock === 0 ? '' : formData.stock}
          onChange={e => {
            const value = e.target.value
            if (value === '') {
              setFormData({ ...formData, stock: 0, inStock: false })
            } else {
              const parsed = parseInt(value, 10)
              if (!isNaN(parsed) && parsed >= 0) {
                setFormData({ 
                  ...formData, 
                  stock: parsed,
                  inStock: parsed > 0
                })
              }
            }
          }}
          className="w-full focus:outline-none p-2 md:p-3 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) text-sm md:text-base bg-white"
          placeholder="0"
        />
      </div>

      {/* Изображения */}
      <ImageGallery
        images={imageUrls}
        onChange={setImageUrls}
      />

      {/* Категории */}
      <div>
        <label className="block text-sm font-medium mb-1">Категории</label>
        <div className="space-y-2 max-h-40 overflow-y-auto border border-(--border) rounded-lg p-2 md:p-3 bg-white">
          {categories.length === 0 ? (
            <p className="text-(--text-muted) text-sm">Нет категорий</p>
          ) : (
            categories.map(cat => {
              const categoryId = String(cat.id)
              return (
                <label key={categoryId} className="flex items-center gap-2 hover:bg-(--mint) p-1 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(categoryId)}
                    onChange={e => {
                      const newIds = e.target.checked
                        ? [...formData.categoryIds, categoryId]
                        : formData.categoryIds.filter(id => id !== categoryId)
                      setFormData({ ...formData, categoryIds: newIds })
                    }}
                    className="w-4 h-4 rounded text-(--pink) focus:ring-(--pink)"
                  />
                  <span className="text-sm md:text-base text-(--text)">{cat.name}</span>
                </label>
              )
            })
          )}
        </div>
      </div>

      {/* В наличии */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="inStock"
          checked={formData.inStock}
          onChange={e => {
            setFormData({
              ...formData,
              inStock: e.target.checked
            })
          }}
          className="w-4 h-4 rounded text-(--pink) focus:ring-(--pink)"
        />
        <label htmlFor="inStock" className="text-sm md:text-base text-(--text)">
          В наличии
        </label>
      </div>

      {/* Кнопки */}
      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-(--border)">
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Создать товар')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Отмена
        </Button>
      </div>
    </form>
  )
}