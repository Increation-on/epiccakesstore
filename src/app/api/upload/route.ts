import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Можно загружать только изображения' }, { status: 400 });
    }

    // Конвертируем в буфер
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Оптимизируем через sharp
    const optimizedBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();
    
    // Генерируем уникальное имя
    const timestamp = Date.now();
    const filename = `product-${timestamp}.webp`;

    // Загружаем в Vercel Blob
    const blob = await put(filename, optimizedBuffer, {
      access: 'public',
      contentType: 'image/webp',
    });

    return NextResponse.json({ url: blob.url });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке файла' },
      { status: 500 }
    );
  }
}