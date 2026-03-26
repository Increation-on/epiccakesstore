// src/app/page.tsx
import Hero from '@/components/features/home/Hero';
import PopularProducts from '@/components/features/home/popularProducts/PopularProducts';
import Advantages from '@/components/features/home/Advantages';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EpicCakesStore — Торты на заказ с доставкой',
  description: 'Вкуснейшие торты на заказ с доставкой. Только натуральные ингредиенты.',
  openGraph: {
    title: 'EpicCakesStore — Торты на заказ',
    description: 'Вкуснейшие торты с доставкой. Натуральные ингредиенты, ручная работа.',
    images: [
      {
        url: '/logo.jpeg',
        width: 800,
        height: 800,
        alt: 'EpicCakes',
      },
    ],
    type: 'website',
    siteName: 'EpicCakesStore',
  },
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PopularProducts />
      <Advantages />
    </main>
  );
}