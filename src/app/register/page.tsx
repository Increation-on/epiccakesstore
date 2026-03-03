'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

      router.push('/api/auth/signin?callbackUrl=/')
    } catch (err: any) {
      setServerError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Регистрация</h1>
        
        {serverError && (
          <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Поле Имя */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Имя
            </label>
            <input
              type="text"
              {...register('name', { 
                required: 'Имя обязательно' 
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Поле Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Поле Пароль */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Загрузка...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <a href="/api/auth/signin" className="text-blue-500 hover:underline">
            Войти
          </a>
        </p>
      </div>
    </div>
  )
}