'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { signIn } from 'next-auth/react'

type FormData = {
  name: string
  email: string
  password: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setServerError('')
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Ошибка регистрации')
      }

      router.push('/login?registered=true')
    } catch (err: any) {
      setServerError(err.message)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-lg border border-(--border) p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-center text-(--text) mb-6 font-serif">
          Регистрация
        </h1>
        
        {serverError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Поле Имя */}
          <div>
            <label className="block text-(--text-muted) mb-2 text-sm">
              Имя
            </label>
            <input
              type="text"
              {...register('name', { required: 'Имя обязательно' })}
              className="w-full px-4 py-2 border border-(--border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--pink) focus:border-transparent transition"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Поле Email */}
          <div>
            <label className="block text-(--text-muted) mb-2 text-sm">
              Email
            </label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email обязателен',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Введите корректный email'
                }
              })}
              className="w-full px-4 py-2 border border-(--border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--pink) focus:border-transparent transition"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Поле Пароль */}
          <div>
            <label className="block text-(--text-muted) mb-2 text-sm">
              Пароль
            </label>
            <input
              type="password"
              {...register('password', { 
                required: 'Пароль обязателен',
                minLength: {
                  value: 6,
                  message: 'Пароль должен быть минимум 6 символов'
                }
              })}
              className="w-full px-4 py-2 border border-(--border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--pink) focus:border-transparent transition"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Загрузка...' : 'Зарегистрироваться'}
          </Button>
        </form>

        <div className="mt-6">
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-2 bg-white border border-(--border) text-(--text) px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Зарегистрироваться через Google
          </button>
        </div>

        <p className="text-center text-(--text-muted) text-sm mt-6">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-(--pink) hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}