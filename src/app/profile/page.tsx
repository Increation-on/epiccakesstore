import { Suspense } from 'react'
import ProfileContent from './ProfileContent'
import type { Metadata } from 'next'
import ProfileSkeleton from '@/components/features/skeleton/ProfileSkeleton'

export const metadata: Metadata = {
  title: 'Личный кабинет | EpicCakesStore',
  description: 'Ваши заказы, отзывы и настройки профиля.',
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  )
}