// app/admin/layout.tsx
import { ReactNode } from "react"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      {/* Навигация админки - будет на всех страницах /admin/* */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-2 py-3 md:h-16 md:py-0">
            <Link href="/admin" className="text-xl font-bold whitespace-nowrap">
              EpicCakesStore Admin 🎂
            </Link>

            {/* Ссылки по центру (на десктопе) */}
            <div className="flex flex-wrap gap-2 md:gap-4 order-2 md:order-0">
              <Link href="/admin/products" className="text-sm md:text-base hover:text-pink-600 whitespace-nowrap">
                Товары
              </Link>
              <Link href="/admin/categories" className="text-sm md:text-base hover:text-pink-600 whitespace-nowrap">
                Категории
              </Link>
              <Link href="/admin/orders" className="text-sm md:text-base hover:text-pink-600 whitespace-nowrap">
                Заказы
              </Link>
              <Link href="/admin/reviews" className="text-sm md:text-base hover:text-pink-600 whitespace-nowrap">
                Отзывы
              </Link>
            </div>

            {/* Ссылка "На сайт" справа */}
            <Link
              href="/"
              className="text-sm md:text-base text-gray-500 hover:text-gray-700 whitespace-nowrap order-last"
            >
              На сайт →
            </Link>
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