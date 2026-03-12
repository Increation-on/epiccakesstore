// app/admin/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  // Получаем сессию на сервере (для дополнительной проверки)
  const session = await getServerSession(authOptions)
  
  // Страховка: если вдруг middleware пропустил не-админа
  if (session?.user?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Панель администратора 🎉
      </h1>
      
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">✅ Middleware работает!</p>
        <p>Ты админ и попал на защищённую страницу.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">👤 Твои данные</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm">
            {JSON.stringify(session?.user, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">🔒 Проверка ролей</h2>
          <ul className="space-y-2">
            <li>✓ Неавторизованные → редирект на логин</li>
            <li>✓ Обычные юзеры → редирект на главную</li>
            <li>✓ Админы → видят эту страницу</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded">
        <p className="text-yellow-800">
          ⚡️ Дальше будем добавлять: управление товарами, заказами, категориями
        </p>
      </div>
    </div>
  )
}