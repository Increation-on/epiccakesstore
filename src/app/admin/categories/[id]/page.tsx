// app/admin/categories/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Category } from '@/types/domain/categoery.types'

export default function EditCategoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const categoryId = String(params.id)
  
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  })

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const res = await fetch(`/api/admin/categories/${categoryId}`)
        if (!res.ok) {
          router.push('/admin/categories')
          return
        }
        const data = await res.json()
        setCategory(data)
        setFormData({
          name: data.name,
          slug: data.slug
        })
      } catch (error) {
        console.error('Error loading category:', error)
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      loadCategory()
    }
  }, [categoryId, router])

  // Защита
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/')
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push('/admin/categories')
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при обновлении')
      }
    } catch (error) {
      console.error('Error updating:', error)
      alert('Ошибка при обновлении категории')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="p-6">Загрузка...</div>
  }

  if (!category) {
    return <div className="p-6">Категория не найдена</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/categories')}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          ← Назад к списку
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Редактирование категории</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={formData.slug}
            onChange={e => setFormData({...formData, slug: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
            placeholder="будет создан из названия"
          />
          <p className="text-xs text-gray-500 mt-1">
            Только латиница, дефисы и цифры
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/categories')}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}