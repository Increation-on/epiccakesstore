// src/components/features/home/Hero.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export default function Hero() {
    return (
        <section className="relative h-137.5 md:h-150 flex items-end"
            style={{
                backgroundImage: "url('/images/cake-background_2.png')",
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundColor: 'var(--mint)',
                backgroundPosition: 'center 30%'
            }}>

            <div className="absolute inset-0 bg-black/15" />

            <div className="relative container mx-auto px-4 text-center pb-44">
                <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg cursor-default font-sans">
                    EpicCakesStore
                </h1>
                <p className="text-2xl text-white mb-8 max-w-2xl mx-auto drop-shadow-lg mt-8 cursor-default font-serif">
                    Торты на заказ с доставкой. Только натуральные ингредиенты и любовь в каждом кусочке
                </p>
                <Link href="/products">
                    <Button size="lg">Смотреть каталог</Button>
                </Link>
            </div>
        </section>
    );
}