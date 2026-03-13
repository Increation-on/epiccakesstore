// app/profile/layout.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return (
    <div className="container mx-auto p-4">
      {/* Навигация профиля */}
      <nav className="mb-6 border-b pb-4">
        <div className="flex gap-6">
          <Link 
            href="/profile" 
            className="text-gray-600 hover:text-blue-600 transition"
          >
            👤 Профиль
          </Link>
          <Link 
            href="/profile/orders" 
            className="text-gray-600 hover:text-blue-600 transition"
          >
            📦 Мои заказы
          </Link>
        </div>
      </nav>
      
      {children}
    </div>
  )
}