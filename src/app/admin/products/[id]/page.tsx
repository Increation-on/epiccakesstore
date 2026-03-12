// app/admin/products/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Product } from '@/types/domain/product.types'
import { Category } from '@/types/domain/categoery.types'
import ProductForm from '../_components/ProductEditForm'

export default function EditProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const productId = String(params.id)
  
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Загружаем товар и категории параллельно
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/products/${productId}`),
          fetch('/api/admin/categories')
        ])
        
        // Проверяем ответ товара
        if (!productRes.ok) {
          if (productRes.status === 404) {
            setError('Товар не найден')
          } else {
            setError('Ошибка при загрузке товара')
          }
          return
        }

        // Проверяем ответ категорий
        if (!categoriesRes.ok) {
          setError('Ошибка при загрузке категорий')
          return
        }

        const productData = await productRes.json()
        const categoriesData = await categoriesRes.json()
        
        console.log('✅ Товар загружен:', productData)
        console.log('✅ Категории загружены:', categoriesData.length)
        
        setProduct(productData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('❌ Ошибка загрузки:', error)
        setError('Ошибка при загрузке данных')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      loadData()
    }
  }, [productId])

  // Защита
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/')
    }
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="p-6">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => router.push('/admin/products')}
          className="mt-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          ← Вернуться к списку
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Товар не найден
        </div>
        <button
          onClick={() => router.push('/admin/products')}
          className="mt-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          ← Вернуться к списку
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/products')}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          ← Назад к списку
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Редактирование товара</h1>
      
      <div className="bg-white p-6 rounded shadow">
        <ProductForm 
          categories={categories}
          initialData={product}
          onSuccess={() => {
            router.push('/admin/products')
          }}
          onCancel={() => router.push('/admin/products')}
          isEditing={true}
        />
      </div>
    </div>
  )
}