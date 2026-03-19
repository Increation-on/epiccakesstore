import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Собираем только переменные, которые нас интересуют
  const envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    // 👇 Безопасно показываем первые символы (чтобы убедиться, что значение есть)
    GOOGLE_ID_PREVIEW: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 8) + '...' : null,
    GOOGLE_SECRET_PREVIEW: process.env.GOOGLE_CLIENT_SECRET ? '✅ exists' : null,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_KEY_PREVIEW: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 8) + '...'
      : null,
  }

  return NextResponse.json({
    message: 'Environment variables check',
    env: envVars,
    allEnvKeys: Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY'))
  })
}