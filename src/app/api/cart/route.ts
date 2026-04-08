// app/api/cart/route.ts - ПОЛНОСТЬЮ
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } }
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await request.json();

    // Полная перезапись: удаляем всё и создаём заново
    await prisma.$transaction(async (tx) => {
      // Удаляем корзину и все её товары
      await tx.cart.deleteMany({
        where: { userId: session.user.id }
      });

      // Если есть товары — создаём новую корзину
      if (items && items.length > 0) {
        await tx.cart.create({
          data: {
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
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ POST /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.cart.deleteMany({
      where: { userId: session.user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ DELETE /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}