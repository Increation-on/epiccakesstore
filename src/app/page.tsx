// src/app/page.tsx
import Hero from '@/components/features/home/Hero';
import PopularProducts from '@/components/features/home/PopularProducts';
import Advantages from '@/components/features/home/Advantages';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PopularProducts />
      <Advantages />
    </main>
  );
}