// app/admin/products/_components/ProductForm.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Category } from '@/types/domain/categoery.types'
import { Product } from '@/types/domain/product.types'

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

  // Заполняем форму при редактировании
  useEffect(() => {
    if (initialData) {
      console.log('🔄 Заполняем форму данными:', initialData)
      
      // Парсим images (может быть строкой JSON или массивом)
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

      console.log(`📡 Отправка ${method} запроса на ${url}`, formData)

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
        console.log('✅ Успешно сохранено:', data)
        onSuccess()
      } else {
        console.error('❌ Ошибка сервера:', data)
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Название <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
          placeholder="Например: Шоколадный торт"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Slug (если пусто - создастся из названия)</label>
        <input
          type="text"
          value={formData.slug}
          onChange={e => setFormData({...formData, slug: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
          placeholder="shokoladnyy-tort"
        />
        <p className="text-xs text-gray-500 mt-1">
          Только латиница, дефисы и цифры
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Описание</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
          rows={4}
          placeholder="Подробное описание товара..."
        />
      </div>

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
          className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Изображение</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.images}
            onChange={e => setFormData({...formData, images: e.target.value})}
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
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
              disabled={uploading}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50 whitespace-nowrap"
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
              className="w-32 h-32 object-cover rounded border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Категории</label>
        <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
          {categories.length === 0 ? (
            <p className="text-gray-500 text-sm">Нет категорий</p>
          ) : (
            categories.map(cat => {
              const categoryId = String(cat.id)
              return (
                <label key={categoryId} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(categoryId)}
                    onChange={e => {
                      const newIds = e.target.checked
                        ? [...formData.categoryIds, categoryId]
                        : formData.categoryIds.filter(id => id !== categoryId)
                      setFormData({...formData, categoryIds: newIds})
                    }}
                    className="rounded text-pink-600 focus:ring-pink-200"
                  />
                  <span className="text-sm">{cat.name}</span>
                </label>
              )
            })
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="inStock"
          checked={formData.inStock}
          onChange={e => setFormData({...formData, inStock: e.target.checked})}
          className="rounded text-pink-600 focus:ring-pink-200"
        />
        <label htmlFor="inStock" className="text-sm">В наличии</label>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <button
          type="submit"
          disabled={loading || uploading}
          className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Создать товар')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
          disabled={loading}
        >
          Отмена
        </button>
      </div>
    </form>
  )
}