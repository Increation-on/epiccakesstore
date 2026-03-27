'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useEffect } from 'react'

export default function ProfileContent() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/')
    }
  }, [session, status, router])

  if (status === 'loading') return null
  if (!session?.user) return null

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 overflow-x-hidden">
      <h1 className="text-3xl font-bold text-(--text) mb-6 font-serif">
        👤 Мой профиль
      </h1>

      <div className="bg-white rounded-lg border border-(--border) p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-(--border) flex-wrap">
            <div className="w-16 h-16 rounded-full bg-(--mint) flex items-center justify-center text-2xl font-bold text-(--text) shrink-0">
              {session.user.name?.[0] || session.user.email?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-(--text) wrap-break-word">
                {session.user.name || 'Пользователь'}
              </h2>
              <p className="text-(--text-muted) wrap-break-word">{session.user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-(--border) gap-1">
              <span className="text-(--text-muted) shrink-0">Email</span>
              <span className="font-medium text-(--text) wrap-break-word text-right sm:text-left">
                {session.user.email}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-(--border) gap-1">
              <span className="text-(--text-muted) shrink-0">Имя</span>
              <span className="font-medium text-(--text) wrap-break-word text-right sm:text-left">
                {session.user.name || 'Не указано'}
              </span>
            </div>
            {session.user.role === 'admin' && (
              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-(--border) gap-1">
                <span className="text-(--text-muted) shrink-0">Роль</span>
                <span className="font-medium text-(--text) wrap-break-word text-right sm:text-left">
                  Администратор
                </span>
              </div>
            )}
            {session.user.createdAt && (
              <div className="flex flex-col sm:flex-row sm:justify-between py-2 gap-1">
                <span className="text-(--text-muted) shrink-0">Аккаунт создан</span>
                <span className="font-medium text-(--text) wrap-break-word text-right sm:text-left">
                  {new Date(session.user.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/profile/orders">
          <Button className="w-full sm:w-auto">
            📦 Мои заказы
          </Button>
        </Link>
      </div>
    </div>
  )
}