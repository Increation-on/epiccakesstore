// app/admin/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.role !== 'admin') {
    redirect('/')
  }

  // Получаем статистику
  const [productsCount, ordersCount, categoriesCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.category.count()
  ])

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">
        Панель администратора
      </h1>
      <p className="text-(--text-muted) mb-8">
        Здравствуйте, {session.user.name || session.user.email}!
      </p>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border border-(--border)">
          <div className="text-2xl font-bold text-(--mint-dark)">{productsCount}</div>
          <div className="text-sm text-(--text-muted)">Товаров</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-(--border)">
          <div className="text-2xl font-bold text-(--mint-dark)">{ordersCount}</div>
          <div className="text-sm text-(--text-muted)">Заказов</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-(--border)">
          <div className="text-2xl font-bold text-(--mint-dark)">{categoriesCount}</div>
          <div className="text-sm text-(--text-muted)">Категорий</div>
        </div>
      </div>

      {/* Быстрые действия */}
      <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/admin/products">
          <Button className="w-full text-white">📦 Управление товарами</Button>
        </Link>
        <Link href="/admin/orders">
          <Button className="w-full text-white">📋 Управление заказами</Button>
        </Link>
        <Link href="/admin/categories">
          <Button className="w-full text-white">🏷️ Управление категориями</Button>
        </Link>
      </div>
    </div>
  )
}