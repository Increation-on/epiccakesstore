'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Product } from '@/types/domain/product.types'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import { toast } from '@/lib/toast'
import { Modal } from '@/components/ui/Modal'
import { Price } from '@/components/ui/Price'

export default function ArchivedProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean
    productId: string | null
    productName: string
  }>({
    isOpen: false,
    productId: null,
    productName: '',
  })
  const [permanentDeleteModal, setPermanentDeleteModal] = useState<{
    isOpen: boolean
    productId: string | null
    productName: string
  }>({
    isOpen: false,
    productId: null,
    productName: '',
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/')
    }
  }, [session, status, router])

  const loadArchivedProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products/archived')
      if (!res.ok) throw new Error('Ошибка загрузки')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error(error)
      toast.error('Не удалось загрузить архивные товары')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArchivedProducts()
  }, [])

  const openRestoreModal = (id: string, name: string) => {
    setRestoreModal({
      isOpen: true,
      productId: id,
      productName: name,
    })
  }

  const closeRestoreModal = () => {
    setRestoreModal({
      isOpen: false,
      productId: null,
      productName: '',
    })
  }

  const confirmRestore = async () => {
    if (!restoreModal.productId) return

    try {
      const res = await fetch(`/api/admin/products/${restoreModal.productId}/restore`, {
        method: 'POST',
      })

      if (res.ok) {
        toast.success(`Товар "${restoreModal.productName}" восстановлен`)
        loadArchivedProducts()
      } else {
        toast.error(`Не удалось восстановить товар "${restoreModal.productName}"`)
      }
    } catch (error) {
      console.error('Error restoring product:', error)
      toast.error('Ошибка при восстановлении товара')
    } finally {
      closeRestoreModal()
    }
  }

  const openPermanentDeleteModal = (id: string, name: string) => {
    setPermanentDeleteModal({
      isOpen: true,
      productId: id,
      productName: name,
    })
  }

  const closePermanentDeleteModal = () => {
    setPermanentDeleteModal({
      isOpen: false,
      productId: null,
      productName: '',
    })
  }

  const confirmPermanentDelete = async () => {
    if (!permanentDeleteModal.productId) return

    try {
      const res = await fetch(`/api/admin/products/${permanentDeleteModal.productId}/permanent`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success(`Товар "${permanentDeleteModal.productName}" полностью удален`)
        loadArchivedProducts()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Не удалось удалить товар')
      }
    } catch (error) {
      console.error('Error permanently deleting product:', error)
      toast.error('Ошибка при удалении товара')
    } finally {
      closePermanentDeleteModal()
    }
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

  if (status === 'loading' || loading) {
    return <div className="p-6">Загрузка...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Архив товаров</h1>
        <Button onClick={() => router.push('/admin/products')}>
          ← К активным товарам
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-(--text-muted)">
          <p className="text-lg">В архиве нет товаров</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow p-4 border border-(--border)">
              <div className="flex gap-4">
                {getImageUrl(product) ? (
                  <div className="relative w-20 h-20 shrink-0">
                    <Image
                      src={getImageUrl(product)!}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-(--mint) rounded flex items-center justify-center">
                    <span className="text-2xl">🍰</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-(--text)">{product.name}</h3>
                  <p className="text-sm text-(--text-muted)"><Price price={product.price} /></p>
                  <p className="text-xs text-gray-400 mt-1">
                    Архив: {product.archivedAt ? new Date(product.archivedAt).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => openRestoreModal(String(product.id), product.name)}
                  className="flex-1"
                >
                  Восстановить
                </Button>
                <Button
                  onClick={() => openPermanentDeleteModal(String(product.id), product.name)}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  🗑️ Удалить навсегда
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={restoreModal.isOpen}
        onClose={closeRestoreModal}
        title="Восстановление товара"
      >
        <p className="text-(--text-muted) mb-6">
          Вы уверены, что хотите восстановить "{restoreModal.productName}"?
          Товар снова появится в каталоге.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={closeRestoreModal}>
            Отмена
          </Button>
          <Button onClick={confirmRestore} className="bg-green-500 hover:bg-green-600">
            Восстановить
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={permanentDeleteModal.isOpen}
        onClose={closePermanentDeleteModal}
        title="Полное удаление товара"
      >
        <p className="text-(--text-muted) mb-4">
          Вы уверены, что хотите полностью удалить "{permanentDeleteModal.productName}"?
        </p>
        <p className="text-red-500 text-sm mb-6">
          ⚠️ Это действие нельзя отменить. Товар будет удален без возможности восстановления.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={closePermanentDeleteModal}>
            Отмена
          </Button>
          <Button onClick={confirmPermanentDelete} className="bg-red-500 hover:bg-red-600">
            Удалить навсегда
          </Button>
        </div>
      </Modal>
    </div>
  )
}