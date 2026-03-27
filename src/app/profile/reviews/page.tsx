'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Review {
  id: string
  rating: number
  text: string
  status: string
  createdAt: string
  product: { name: string; id: string }
}

export default function MyReviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch('/api/user/reviews')
        const data = await res.json()
        setReviews(data)
      } catch (error) {
        console.error('Error loading reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    if (session) loadReviews()
  }, [session])

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return { text: 'Одобрен', color: 'text-green-600' }
      case 'pending': return { text: 'На модерации', color: 'text-yellow-600' }
      case 'rejected': return { text: 'Отклонен', color: 'text-red-600' }
      default: return { text: status, color: 'text-gray-600' }
    }
  }

  if (loading) return <div className="p-6">Загрузка...</div>

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Мои отзывы</h1>

      {reviews.length === 0 ? (
        <p className="text-gray-500">Вы еще не оставляли отзывы</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const statusInfo = getStatusText(review.status)
            return (
              <div key={review.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">
                      <a href={`/products/${review.product.id}`} className="hover:text-(--pink)">
                        {review.product.name}
                      </a>
                    </div>
                    <div className="flex text-yellow-400 mt-1">
                      {[1,2,3,4,5].map(star => (
                        <span key={star}>{star <= review.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </div>
                </div>
                <p className="text-gray-700 mt-2">{review.text}</p>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
                {review.status === 'rejected' && (
                  <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded">
                    ❌ Отзыв не прошел модерацию. Вы можете оставить новый отзыв на странице товара.
                  </div>
                )}
                {review.status === 'pending' && (
                  <div className="mt-3 p-2 bg-yellow-50 text-yellow-700 text-sm rounded">
                    ⏳ Отзыв отправлен на модерацию. Скоро он появится на сайте.
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}