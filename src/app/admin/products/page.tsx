// app/admin/products/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Product } from '@/types/domain/product.types'
import { Category } from '@/types/domain/categoery.types'
import ProductForm from './_components/ProductEditForm'

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories')
      ])
      
      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      
      console.log('✅ Товары загружены:', productsData.length)
      console.log('✅ Категории загружены:', categoriesData.length)
      
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Защита
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/')
    }
  }, [session, status, router])

  const handleDelete = async (id: Product['id']) => {
    if (!confirm('Точно удалить?')) return
    
    const productId = String(id)
    
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="p-6">Загрузка...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление товарами</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
        >
          {showForm ? 'Отмена' : '+ Добавить товар'}
        </button>
      </div>

      {/* Форма добавления */}
      {showForm && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Новый товар</h2>
          <ProductForm 
            categories={categories}
            onSuccess={() => {
              setShowForm(false)
              loadData() // перезагружаем список
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Таблица товаров */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Товар
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Категории
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Цена
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Наличие
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {product.images && (
                      <img 
                        src={Array.isArray(product.images) 
                          ? product.images[0] 
                          : JSON.parse(product.images)[0]
                        } 
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded mr-3"
                      />
                    )}
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.description.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {product.categories?.map(cat => (
                      <span 
                        key={cat.id}
                        className="px-2 py-1 bg-gray-100 text-xs rounded"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">{product.price} ₽</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${
                    product.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'В наличии' : 'Нет'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => router.push(`/admin/products/${product.id}`)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}