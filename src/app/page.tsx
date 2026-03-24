// src/app/page.tsx
import Hero from '@/components/features/home/Hero';
import PopularProducts from '@/components/features/home/PopularProducts';
import Advantages from '@/components/features/home/Advantages';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EpicCakesStore — Торты на заказ с доставкой',
  description: 'Вкуснейшие торты на заказ с доставкой. Только натуральные ингредиенты.',
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