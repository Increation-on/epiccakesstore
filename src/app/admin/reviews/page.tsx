'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'

interface Review {
  id: string
  rating: number
  text: string
  status: string
  createdAt: string
  user: { name: string; email: string }
  product: { name: string; id: string }
}

export default function AdminReviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  // Защита
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/')
    }
  }, [session, status, router])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reviews?status=${filter}`)
      const data = await res.json()
      setReviews(data)
    } catch (error) {
      toast.error('Ошибка загрузки отзывов')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [filter])

  const updateStatus = async (reviewId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        toast.success(`Отзыв ${newStatus === 'approved' ? 'одобрен' : 'отклонен'}`)
        loadReviews()
      } else {
        toast.error('Ошибка обновления')
      }
    } catch (error) {
      toast.error('Ошибка обновления')
    }
  }

  if (status === 'loading' || loading) {
    return <div className="p-6">Загрузка...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Модерация отзывов</h1>

      {/* Фильтры */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          На модерации
        </Button>
        <Button
          variant={filter === 'approved' ? 'primary' : 'outline'}
          onClick={() => setFilter('approved')}
        >
          Одобренные
        </Button>
        <Button
          variant={filter === 'rejected' ? 'primary' : 'outline'}
          onClick={() => setFilter('rejected')}
        >
          Отклоненные
        </Button>
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Все
        </Button>
      </div>

      {/* Список отзывов */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Нет отзывов</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">{review.user.name}</div>
                  <div className="text-sm text-gray-500">{review.user.email}</div>
                  <div className="text-sm text-gray-500">
                    Товар: <a href={`/products/${review.product.id}`} className="text-(--pink) hover:underline">{review.product.name}</a>
                  </div>
                </div>
                <div className="flex gap-2">
                  {review.status !== 'approved' && (
                    <Button size="sm" onClick={() => updateStatus(review.id, 'approved')}>
                      ✅ Одобрить
                    </Button>
                  )}
                  {review.status !== 'rejected' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(review.id, 'rejected')}>
                      ❌ Отклонить
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex text-yellow-400 mb-2">
                {[1,2,3,4,5].map(star => (
                  <span key={star}>{star <= review.rating ? '★' : '☆'}</span>
                ))}
              </div>
              <p className="text-gray-700">{review.text}</p>
              <div className="text-xs text-gray-400 mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}