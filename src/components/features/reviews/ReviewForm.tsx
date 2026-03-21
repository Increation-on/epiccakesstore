'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface Props {
  productId: string
}

export function ReviewForm({ productId }: Props) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [existingReview, setExistingReview] = useState<any>(null)
  const [checking, setChecking] = useState(true)

  // Проверяем, есть ли уже отзыв
  useEffect(() => {
    fetch(`/api/products/${productId}/my-review`)
      .then(res => res.json())
      .then(data => {
        if (data.review) setExistingReview(data.review)
      })
      .finally(() => setChecking(false))
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, text }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при отправке')
      }

      setSuccess(true)
      setText('')
      setRating(5)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Пока проверяем
  if (checking) {
    return <div className="text-(--text-muted) text-center py-4">Загрузка...</div>
  }

  // Если не авторизован
  if (status === 'unauthenticated') {
    return (
      <div className="border border-(--border) rounded-lg p-6 bg-(--bg) text-center">
        <p className="text-(--text-muted) mb-3">Хотите оставить отзыв?</p>
        <a href="/api/auth/signin" className="text-(--pink) hover:underline">
          Войдите в аккаунт
        </a>
      </div>
    )
  }

  // Если уже есть отзыв
  if (existingReview) {
    return (
      <div className="border border-green-200 rounded-lg p-5 bg-green-50">
        <p className="text-green-700 font-semibold mb-2">✅ Вы уже оставили отзыв</p>
        <div className="mt-2">
          <div className="flex text-yellow-400 mb-1">
            {[1,2,3,4,5].map(star => (
              <span key={star}>{star <= existingReview.rating ? '★' : '☆'}</span>
            ))}
          </div>
          <p className="text-(--text-muted)">{existingReview.text}</p>
        </div>
        <p className="text-xs text-(--text-muted) mt-3">
          Спасибо, что делитесь мнением! 🙌
        </p>
      </div>
    )
  }

  // Если успешно отправили
  if (success) {
    return (
      <div className="border border-green-200 rounded-lg p-5 bg-green-50 text-green-700">
        ✅ Отзыв отправлен! Спасибо.
      </div>
    )
  }

  // Форма
  return (
    <form onSubmit={handleSubmit} className="border border-(--border) rounded-lg p-5 space-y-4 bg-white">
      <h3 className="font-semibold text-lg text-(--text) font-serif">Оставить отзыв</h3>

      <div>
        <label className="block mb-2 text-(--text-muted) text-sm">Оценка</label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition hover:scale-110 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="text" className="block mb-2 text-(--text-muted) text-sm">
          Ваш отзыв
        </label>
        <textarea
          id="text"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-(--border) rounded-lg p-3 text-(--text) focus:outline-none focus:ring-2 focus:ring-(--pink) focus:border-transparent transition"
          placeholder="Напишите, что думаете о товаре..."
          required
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? 'Отправка...' : 'Отправить отзыв'}
      </Button>
    </form>
  )
}