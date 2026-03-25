'use client'

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <section className="relative h-100 md:h-150 flex items-end overflow-hidden">
      {/* Блюр-плейсхолдер — грузится мгновенно */}
      <Image
        src="/images/hero-blur.jpg"
        alt=""
        fill
        className={`object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        priority
        style={{ objectPosition: 'center 30%' }}
      />
      
      {/* Основное изображение */}
      <Image
        src="/images/cake-background_2.webp"
        alt="EpicCakesStore — торты на заказ"
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className={`object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        quality={85}
        style={{ objectPosition: 'center 30%' }}
        onLoad={() => setIsLoaded(true)}
      />
      
      <div className="absolute inset-0 bg-black/15" />
      
      <div className="relative container mx-auto px-4 text-center pb-20 md:pb-44 z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg cursor-default font-sans">
          EpicCakesStore
        </h1>
        <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto drop-shadow-lg mt-8 cursor-default font-serif">
          Торты на заказ с доставкой. Только натуральные ингредиенты и любовь в каждом кусочке
        </p>
        <Link href="/products">
          <Button size="lg">Смотреть каталог</Button>
        </Link>
      </div>
    </section>
  );
}