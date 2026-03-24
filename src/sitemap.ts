// src/app/sitemap.ts
import { prisma } from '@/lib/prisma'

export default async function sitemap() {
  // Статические страницы
  const staticPages = [
    { url: '/', lastModified: new Date() },
    { url: '/products', lastModified: new Date() },
    { url: '/about', lastModified: new Date() },
    { url: '/contacts', lastModified: new Date() },
  ]

  // Динамические товары
  const products = await prisma.product.findMany({
    select: { id: true, updatedAt: true },
  })
  const productPages = products.map((product) => ({
    url: `/products/${product.id}`,
    lastModified: product.updatedAt,
  }))

  // Динамические категории (если у тебя есть страницы категорий)
  const categories = await prisma.category.findMany({
    select: { id: true, updatedAt: true },
  })
  const categoryPages = categories.map((category) => ({
    url: `/products?category=${category.id}`,
    lastModified: category.updatedAt,
  }))

  return [...staticPages, ...productPages, ...categoryPages]
}