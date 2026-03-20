// src/components/ui/Logo.tsx
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  withText?: boolean;
  className?: string;
  imageClassName?: string;
}

export default function Logo({ 
  className = '',
  imageClassName = ''
}: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo.jpeg"  // TODO: заменить на реальный путь
        alt="EpicCakes"
        width={80}
        height={80}
        className={`object-contain ${imageClassName}`}
        priority  // лого на всех страницах, priority ускорит загрузку
      />
    </Link>
  );
}