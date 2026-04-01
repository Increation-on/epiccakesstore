import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const product = await prisma.product.findUnique({
      where: { id },
      select: { isArchived: true }
    })
    
    return NextResponse.json({ 
      isArchived: product?.isArchived ?? false 
    })
  } catch (error) {
    console.error('Error checking product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}