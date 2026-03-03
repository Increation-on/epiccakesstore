export { withAuth as proxy } from "next-auth/middleware"

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*"]
}