'use client'

import { useState } from 'react'
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
      router.refresh() // чтобы обновить список отзывов (если он рядом)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'unauthenticated') {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 text-center">
        <p className="mb-2">Хотите оставить отзыв?</p>
        <a
          href="/api/auth/signin"
          className="text-blue-600 hover:underline"
        >
          Войдите в аккаунт
        </a>
      </div>
    )
  }

  if (success) {
    return (
      <div className="border rounded-lg p-4 bg-green-50 text-green-700">
        ✅ Отзыв отправлен! Спасибо.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-lg">Оставить отзыв</h3>

      {/* Звёздочки */}
      <div>
        <label className="block mb-1 font-medium">Оценка</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
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

      {/* Текст отзыва */}
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

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

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