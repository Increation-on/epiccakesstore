// app/admin/categories/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Category } from '@/types/domain/categoery.types'
import { Button } from '@/components/ui/Button'
import CategoryEditForm from '../_components/CategoryEditForm'

export default function EditCategoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const categoryId = String(params.id)
  
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const res = await fetch(`/api/admin/categories/${categoryId}`)
        
        if (!res.ok) {
          if (res.status === 404) {
            setError('Категория не найдена')
          } else {
            setError('Ошибка при загрузке категории')
          }
          return
        }

        const data = await res.json()
        setCategory(data)
      } catch (error) {
        console.error('Ошибка загрузки:', error)
        setError('Ошибка при загрузке данных')
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      loadCategory()
    }
  }, [categoryId])

  // Защита
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/')
    }
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return <div className="p-4 md:p-6">Загрузка...</div>
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <Button
          onClick={() => router.push('/admin/categories')}
          className="mt-4"
        >
          ← Вернуться к списку
        </Button>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Категория не найдена
        </div>
        <Button
          onClick={() => router.push('/admin/categories')}
          className="mt-4"
        >
          ← Вернуться к списку
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <button
          onClick={() => router.push('/admin/categories')}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm md:text-base"
        >
          ← Назад к списку
        </button>
      </div>

      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
        Редактирование категории
      </h1>
      
      <div className="bg-white p-4 md:p-6 rounded shadow">
        <CategoryEditForm 
          initialData={category}
          onSuccess={() => {
            router.push('/admin/categories')
          }}
          onCancel={() => router.push('/admin/categories')}
          isEditing={true}
        />
      </div>
    </div>
  )
}