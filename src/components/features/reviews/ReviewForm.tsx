'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
  
  // Новые состояния
  const [existingReview, setExistingReview] = useState<any>(null)
  const [checking, setChecking] = useState(true)

  // Проверяем, есть ли уже отзыв
  useEffect(() => {
    fetch(`/api/products/${productId}/my-review`)
      .then(res => res.json())
      .then(data => {
         console.log('📦 my-review ответ:', data)
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
    return <div className="text-gray-400">Загрузка...</div>
  }

  // Если не авторизован
  if (status === 'unauthenticated') {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 text-center">
        <p className="mb-2">Хотите оставить отзыв?</p>
        <a href="/api/auth/signin" className="text-blue-600 hover:underline">
          Войдите в аккаунт
        </a>
      </div>
    )
  }

  // Если уже есть отзыв
  if (existingReview) {
    return (
      <div className="border rounded-lg p-4 bg-green-50">
        <p className="text-green-700 font-semibold">✅ Вы уже оставили отзыв</p>
        <div className="mt-2 text-gray-700">
          <div className="flex text-yellow-400 mb-1">
            {[1,2,3,4,5].map(star => (
              <span key={star}>{star <= existingReview.rating ? '★' : '☆'}</span>
            ))}
          </div>
          <p>{existingReview.text}</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Спасибо, что делитесь мнением! 🙌
        </p>
      </div>
    )
  }

  // Если успешно отправили
  if (success) {
    return (
      <div className="border rounded-lg p-4 bg-green-50 text-green-700">
        ✅ Отзыв отправлен! Спасибо.
      </div>
    )
  }

  // Форма
  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-lg">Оставить отзыв</h3>

      <div>
        <label className="block mb-1 font-medium">Оценка</label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:scale-110 transition`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="text" className="block mb-1 font-medium">
          Ваш отзыв
        </label>
        <textarea
          id="text"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border rounded-lg p-2"
          placeholder="Напишите, что думаете о товаре..."
          required
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Отправка...' : 'Отправить отзыв'}
      </button>
    </form>
  )
}