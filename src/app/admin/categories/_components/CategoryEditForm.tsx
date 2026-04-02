//app/admin/categories/_components/CategoryEditForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types/domain/categoery.types'
import { Button } from '@/components/ui/Button'

type Props = {
  initialData?: Category
  onSuccess: () => void
  onCancel: () => void
  isEditing?: boolean
}

export default function CategoryEditForm({ 
  initialData,
  onSuccess, 
  onCancel,
  isEditing = false 
}: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing && initialData?.id
        ? `/api/admin/categories/${String(initialData.id)}`
        : '/api/admin/categories'
      
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        onSuccess()
      } else {
        const error = await res.json()
        alert(error.error || `Ошибка при ${isEditing ? 'обновлении' : 'создании'} категории`)
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert(`Ошибка при ${isEditing ? 'обновлении' : 'создании'} категории`)
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
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 md:p-3 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--pink) focus:border-(--pink) text-sm md:text-base bg-white"
          placeholder="Например: Торты"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Создать категорию')}
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