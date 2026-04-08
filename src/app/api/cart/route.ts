// app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

// GET - получить корзину пользователя
export async function GET() {
  try {
    // Пробуем получить сессию с явными опциями
    const session = await getServerSession(authOptions);
    
   
    
    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 }); // Пустая корзина для неавторизованных
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    const items = cart?.items.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      addedAt: item.addedAt.toISOString()
    })) || [];

    return NextResponse.json(items);
  } catch (error) {
    console.error('❌ GET /api/cart error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - обновить корзину
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await request.json();

    await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {
        items: {
          deleteMany: {},
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            addedAt: new Date(item.addedAt || Date.now())
          }))
        },
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            addedAt: new Date(item.addedAt || Date.now())
          }))
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ POST /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

// DELETE - очистить корзину
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.cart.delete({
      where: { userId: session.user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ DELETE /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}