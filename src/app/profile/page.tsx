//app/profile/page.tsx

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/api/auth/signin')
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Профиль</h1>
      
      <div className="space-y-2">
        <p><strong>Email:</strong> {session.user?.email}</p>
        <p><strong>Имя:</strong> {session.user?.name || 'Не указано'}</p>
        <p><strong>Роль:</strong> {session.user?.role || 'user'}</p>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        * Это защищённая страница. Если ты её видишь — ты авторизован.
      </div>
    </div>
  )
}