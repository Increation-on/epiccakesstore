import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/api/auth/signin')
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-(--text) mb-6 font-serif">
        👤 Мой профиль
      </h1>
      
      <div className="bg-white rounded-lg border border-(--border) p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-(--border)">
            <div className="w-16 h-16 rounded-full bg-(--mint) flex items-center justify-center text-2xl font-bold text-(--text)">
              {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-(--text)">
                {session.user?.name || 'Пользователь'}
              </h2>
              <p className="text-(--text-muted)">{session.user?.email}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-(--border)">
              <span className="text-(--text-muted)">Email</span>
              <span className="font-medium text-(--text)">{session.user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-(--border)">
              <span className="text-(--text-muted)">Имя</span>
              <span className="font-medium text-(--text)">{session.user?.name || 'Не указано'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-(--border)">
              <span className="text-(--text-muted)">Роль</span>
              <span className="font-medium text-(--text)">
                {session.user?.role === 'admin' ? 'Администратор' : 'Покупатель'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-(--text-muted)">Аккаунт создан</span>
              <span className="font-medium text-(--text)">
                {session.user?.createdAt 
                  ? new Date(session.user.createdAt).toLocaleDateString('ru-RU')
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}