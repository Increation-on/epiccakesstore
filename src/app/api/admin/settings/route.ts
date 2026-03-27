import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const settings = await prisma.setting.findMany()
  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value === 'true'
    return acc
  }, {} as Record<string, boolean>)

  return NextResponse.json({
    reviewModeration: settingsMap.reviewModeration !== false,
  })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const { key, value } = await request.json()

  await prisma.setting.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  })

  return NextResponse.json({ success: true })
}