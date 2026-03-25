// app/api/upload/route.ts
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import sharp from 'sharp'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      )
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Можно загружать только изображения' },
        { status: 400 }
      )
    }

    // Конвертируем в буфер
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Оптимизируем изображение через sharp
    const optimizedBuffer = await sharp(buffer)
      .webp({ quality: 80 })           // Конвертируем в WebP с качеством 80
      .resize(800, 800, {              // Ресайзим до 800px
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer()
    
    // Создаём папку, если её нет
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    await mkdir(uploadDir, { recursive: true })

    // Сохраняем файл с расширением .webp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const filename = `${uniqueSuffix}.webp`
    const filepath = path.join(uploadDir, filename)
    
    await writeFile(filepath, optimizedBuffer)

    // Возвращаем URL для доступа к файлу
    const fileUrl = `/uploads/${filename}`

    return NextResponse.json({ url: fileUrl })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Ошибка при загрузке файла' },
      { status: 500 }
    )
  }
}