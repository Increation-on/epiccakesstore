'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Product } from '@/types/domain/product.types'
import { Category } from '@/types/domain/categoery.types'
import { Button } from '@/components/ui/Button'
import ProductForm from './_components/ProductEditForm'
import Image from 'next/image'
import { toast } from '@/lib/toast'
import { Modal } from '@/components/ui/Modal'

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    productId: string | null
    productName: string
  }>({
    isOpen: false,
    productId: null,
    productName: '',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories')
      ])

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Ошибка загрузки данных')
      }

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()

      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error)
      toast.error('Не удалось загрузить товары')
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

  const openDeleteModal = (id: Product['id'], name: string) => {
    setDeleteModal({
      isOpen: true,
      productId: String(id),
      productName: name,
    })
  }

  const confirmDelete = async () => {
    if (!deleteModal.productId) return

    try {
      const res = await fetch(`/api/admin/products/${deleteModal.productId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setProducts(products.filter(p => p.id !== deleteModal.productId))
        toast.success(`Товар "${deleteModal.productName}" удален`)
      } else {
        toast.error(`Не удалось удалить товар "${deleteModal.productName}"`)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Ошибка при удалении товара')
    } finally {
      setDeleteModal({ isOpen: false, productId: null, productName: '' })
    }
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, productId: null, productName: '' })
  }

  if (status === 'loading' || loading) {
    return <div className="p-6">Загрузка...</div>
  }

  const getImageUrl = (product: Product) => {
    if (!product.images) return null
    try {
      const parsed = typeof product.images === 'string'
        ? JSON.parse(product.images)
        : product.images
      return Array.isArray(parsed) && parsed[0] ? parsed[0] : null
    } catch {
      return null
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Управление товарами</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="whitespace-nowrap"
        >
          {showForm ? 'Отмена' : '+ Добавить товар'}
        </Button>
      </div>

      {/* Форма добавления */}
      {showForm && (
        <div className="bg-white p-4 md:p-6 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Новый товар</h2>
          <ProductForm
            categories={categories}
            onSuccess={() => {
              setShowForm(false)
              loadData()
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Таблица — только на десктопе */}
      <div className="hidden md:block bg-white rounded shadow overflow-x-auto">
        <div className="min-w-160">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Товар
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Категории
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Цена
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Количество
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getImageUrl(product) && (
                        <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
                          <Image
                            src={getImageUrl(product)!}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                            sizes="40px"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-sm md:text-base wrap-break-word">
                          {product.name}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500 wrap-break-word line-clamp-1">
                          {product.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    {product.categories && product.categories.length > 0 ? (
                      <div className="overflow-x-auto max-w-37.5 md:max-w-none">
                        <div className="flex gap-1 min-w-max">
                          {product.categories.map(cat => (
                            <span
                              key={cat.id}
                              className="px-1.5 py-0.5 md:px-2 md:py-1 bg-gray-100 text-xs rounded whitespace-nowrap"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm md:text-base whitespace-nowrap">
                    {product.price} ₽
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`whitespace-nowrap px-2 py-1 rounded text-sm ${(product.stock ?? 0) === 0
                      ? 'bg-red-100 text-red-800'
                      : (product.stock ?? 0) <= 5
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-green-500'
                      }`}>
                      {product.stock ?? 0} шт
                    </span>
                    <span className={`inline-block w-3 h-3 rounded-full ml-2 ${product.inStock ? 'bg-green-500' : 'bg-red-500'
                      }`} title={product.inStock ? 'В наличии' : 'Отключен'} />
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                      className="text-blue-600 hover:text-blue-800 mr-2 md:mr-3 text-lg md:text-base"
                      aria-label="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openDeleteModal(product.id, product.name)}
                      className="text-red-600 hover:text-red-800 text-lg md:text-base"
                      aria-label="Удалить"
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

      {/* Карточки — только на мобилке */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded shadow p-4">
            <div className="flex gap-3">
              {getImageUrl(product) ? (
                <div className="relative w-16 h-16 shrink-0">
                  <Image
                    src={getImageUrl(product)!}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded shrink-0 flex items-center justify-center text-2xl">
                  🍰
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 wrap-break-word">
                  {product.name}
                </div>
                <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.description?.substring(0, 80)}...
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-lg font-bold text-pink-600">
                    {product.price} ₽
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded ${(product.stock ?? 0) === 0
                    ? 'bg-red-100 text-red-800'
                    : (product.stock ?? 0) <= 5
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-green-500'
                    }`}>
                    {product.stock ?? 0} шт
                  </span>
                  <span className={`inline-block w-3 h-3 rounded-full ml-1 ${product.inStock ? 'bg-green-500' : 'bg-red-500'
                    }`} title={product.inStock ? 'В наличии' : 'Отключен'} />
                </div>

                {product.categories && product.categories.length > 0 && (
                  <div className="overflow-x-auto mt-3">
                    <div className="flex gap-1 min-w-max">
                      {product.categories.map(cat => (
                        <span
                          key={cat.id}
                          className="px-2 py-0.5 bg-gray-100 text-xs rounded whitespace-nowrap"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/admin/products/${product.id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    ✏️ Редактировать
                  </button>
                  <button
                    onClick={() => openDeleteModal(product.id, product.name)}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  >
                    🗑️ Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Удаление товара"
      >
        <p className="text-(--text-muted) mb-6">
          Вы уверены, что хотите удалить "{deleteModal.productName}"?
          Это действие нельзя отменить.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={closeDeleteModal}>
            Отмена
          </Button>
          <Button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
            Удалить
          </Button>
        </div>
      </Modal>
    </div>
  )
}