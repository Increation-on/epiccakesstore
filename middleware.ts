import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    
    // Проверка для админских маршрутов
    if (isAdminRoute && token?.role !== 'admin') {
      // Если не админ - на главную
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    // Для всех остальных защищённых маршрутов просто пропускаем
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Для /profile и других защищённых маршрутов нужен просто токен
        // Для /admin проверим выше, тут только базовая авторизация
        return !!token
      }
    },
  }
)

export const config = {
  matcher: [
    '/profile/:path*',  // Только авторизованные
    '/admin/:path*'     // Авторизованные + проверка роли в middleware
  ]
}