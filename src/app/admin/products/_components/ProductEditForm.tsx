// app/admin/products/_components/ProductForm.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Category } from '@/types/domain/categoery.types'
import { Product } from '@/types/domain/product.types'
import { Button } from '@/components/ui/Button'

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
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    images: '',
    inStock: true,
    categoryIds: [] as string[]
  })

  useEffect(() => {
    if (initialData) {
      let imageUrl = ''
      if (initialData.images) {
        try {
          const images = typeof initialData.images === 'string' 
            ? JSON.parse(initialData.images) 
            : initialData.images
          imageUrl = Array.isArray(images) ? images[0] || '' : ''
        } catch {
          imageUrl = ''
        }
      }

      setFormData({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || '',
        price: String(initialData.price),
        images: imageUrl,
        inStock: initialData.inStock,
        categoryIds: initialData.categories?.map(cat => String(cat.id)) || []
      })
    }
  }, [initialData])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (!res.ok) {
        throw new Error('Ошибка загрузки')
      }

      const data = await res.json()
      setFormData(prev => ({ ...prev, images: data.url }))
      
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Ошибка при загрузке изображения')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

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
          images: formData.images ? JSON.stringify([formData.images]) : '[]',
          categoryIds: formData.categoryIds
        })
      })

      const data = await res.json()

      if (res.ok) {
        onSuccess()
      } else {
        alert(data.error || `Ошибка при ${isEditing ? 'обновлении' : 'создании'} товара`)
      }
    } catch (error) {
      console.error('❌ Ошибка:', error)
      alert(`Ошибка при ${isEditing ? 'обновлении' : 'создании'} товара`)
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
          onChange={e => setFormData({...formData, name: e.target.value})}
          className="w-full p-2 md:p-3 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) text-sm md:text-base bg-white"
          placeholder="Например: Шоколадный торт"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium mb-1">Slug (если пусто - создастся из названия)</label>
        <input
          type="text"
          value={formData.slug}
          onChange={e => setFormData({...formData, slug: e.target.value})}
          className="w-full p-2 md:p-3 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) text-sm md:text-base bg-white"
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
          onChange={e => setFormData({...formData, description: e.target.value})}
          className="w-full p-2 md:p-3 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) text-sm md:text-base bg-white"
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
          onChange={e => setFormData({...formData, price: e.target.value})}
          className="w-full p-2 md:p-3 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) text-sm md:text-base bg-white"
          placeholder="0.00"
        />
      </div>

      {/* Изображение */}
      <div>
        <label className="block text-sm font-medium mb-1">Изображение</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={formData.images}
            onChange={e => setFormData({...formData, images: e.target.value})}
            className="flex-1 p-2 md:p-3 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) text-sm md:text-base bg-white"
            placeholder="/uploads/image.jpg"
          />
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 w-full cursor-pointer"
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 whitespace-nowrap text-sm md:text-base cursor-pointer"
            >
              {uploading ? 'Загрузка...' : 'Выбрать файл'}
            </button>
          </div>
        </div>
        
        {formData.images && (
          <div className="mt-2">
            <img 
              src={formData.images} 
              alt="preview"
              className="w-24 h-24 md:w-32 md:h-32 object-cover rounded border border-(--border)"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

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
                      setFormData({...formData, categoryIds: newIds})
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
          onChange={e => setFormData({...formData, inStock: e.target.checked})}
          className="w-4 h-4 rounded text-(--pink) focus:ring-(--pink)"
        />
        <label htmlFor="inStock" className="text-sm md:text-base text-(--text)">В наличии</label>
      </div>

      {/* Кнопки */}
      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-(--border)">
        <Button
          type="submit"
          disabled={loading || uploading}
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