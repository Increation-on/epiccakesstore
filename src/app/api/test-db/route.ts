import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Пытаемся просто получить количество пользователей
    const userCount = await prisma.user.count()
    return NextResponse.json({ 
      success: true, 
      userCount,
      message: 'Database connection OK' 
    })
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}