// app/admin/layout.tsx
import { ReactNode } from "react"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Навигация админки - будет на всех страницах /admin/* */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="text-xl font-bold">
              EpicCakes Admin 🎂
            </Link>
            <div className="flex gap-4">
              {/* 👇 Вот она, ссылка на товары! */}
              <Link 
                href="/admin/products" 
                className="hover:text-pink-600"
              >
                Товары
              </Link>
              <Link 
                href="/admin/orders" 
                className="hover:text-pink-600"
              >
                Заказы
              </Link>
              <Link 
                href="/admin/categories" 
                className="hover:text-pink-600"
              >
                Категории
              </Link>
              <Link 
                href="/" 
                className="text-gray-500 hover:text-gray-700"
              >
                На сайт →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Сюда будет подставляться содержимое page.tsx */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}