import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
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
    <div className="container mx-auto px-4 py-8">
      {/* Навигация профиля */}
      <nav className="mb-8 border-b border-(--border) pb-4">
        <div className="flex gap-6">
          <Link 
            href="/profile" 
            className="text-(--text-muted) hover:text-(--pink) transition font-medium"
          >
            👤 Профиль
          </Link>
          <Link 
            href="/profile/orders" 
            className="text-(--text-muted) hover:text-(--pink) transition font-medium"
          >
            📦 Мои заказы
          </Link>
        </div>
      </nav>
      
      {children}
    </div>
  )
}