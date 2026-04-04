//src/app/cart/page.tsx

import { Suspense } from 'react'
import CartContent from '../../components/features/cart/CartContent'
import CartSkeleton from '@/components/features/skeleton/CartSkeleton'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/route'

export const metadata: Metadata = {
  title: 'Корзина | EpicCakesStore',
  description: 'Оформите заказ. Просмотрите выбранные товары.',
}

export default async function CartPage() {
  const session = await getServerSession(authOptions)
  
  // Если пользователь не авторизован — редирект на логин
  if (!session) {
    redirect('/login?callbackUrl=/cart')
  }

  return (
    <Suspense fallback={<CartSkeleton />}>
      <CartContent />
    </Suspense>
  )
}