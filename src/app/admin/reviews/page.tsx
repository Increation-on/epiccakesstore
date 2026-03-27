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
  const [moderationEnabled, setModerationEnabled] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        const data = await res.json()
        setModerationEnabled(data.reviewModeration !== false)
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    if (session) loadSettings()
  }, [session])

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

  const toggleModeration = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'reviewModeration',
          value: !moderationEnabled,
        }),
      })

      if (res.ok) {
        setModerationEnabled(!moderationEnabled)
        toast.success(`Модерация ${!moderationEnabled ? 'включена' : 'отключена'}`)
      } else {
        toast.error('Ошибка сохранения')
      }
    } catch (error) {
      toast.error('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="p-6">Загрузка...</div>
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Модерация отзывов</h1>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Модерация:</span>
          <button
            onClick={toggleModeration}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${moderationEnabled ? 'bg-(--pink)' : 'bg-gray-300'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${moderationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
          <span className="text-sm text-gray-600">
            {moderationEnabled ? 'включена' : 'выключена'}
          </span>
        </div>
      </div>

      {/* Фильтры — только горизонтальный скролл */}
      {/* Фильтры — горизонтальный скролл с намеком */}
      <div className="relative">
        <div className="overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <div className="flex gap-2">
            <Button
              variant={filter === 'pending' ? 'primary' : 'outline'}
              onClick={() => setFilter('pending')}
              size="sm"
              className="whitespace-nowrap"
            >
              На модерации
            </Button>
            <Button
              variant={filter === 'approved' ? 'primary' : 'outline'}
              onClick={() => setFilter('approved')}
              size="sm"
              className="whitespace-nowrap"
            >
              Одобренные
            </Button>
            <Button
              variant={filter === 'rejected' ? 'primary' : 'outline'}
              onClick={() => setFilter('rejected')}
              size="sm"
              className="whitespace-nowrap"
            >
              Отклоненные
            </Button>
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
              className="whitespace-nowrap"
            >
              Все
            </Button>
          </div>
        </div>
        {/* Градиент-намек на скролл */}
<div className="pointer-events-none absolute right-0 top-0 w-10 h-7 bg-linear-to-l from-white to-transparent" />
      </div>

      {/* Список отзывов */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Нет отзывов</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 bg-white">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
                <div>
                  <div className="font-semibold">{review.user.name}</div>
                  <div className="text-sm text-gray-500">{review.user.email}</div>
                  <div className="text-sm text-gray-500">
                    Товар:{' '}
                    <a href={`/products/${review.product.id}`} className="text-(--pink) hover:underline">
                      {review.product.name}
                    </a>
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
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>{star <= review.rating ? '★' : '☆'}</span>
                ))}
              </div>
              <p className="text-gray-700 wrap-break-word">{review.text}</p>
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