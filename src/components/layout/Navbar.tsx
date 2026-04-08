'use client'

import Link from 'next/link';

type NavbarProps = {
  isAdmin: boolean;
  isLoggedIn: boolean;
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export default function Navbar({ isAdmin, isLoggedIn, isMobile = false, onLinkClick }: NavbarProps) {
  const handleClick = () => {
    if (onLinkClick) onLinkClick();
  };

  const linkClass = isMobile 
    ? "block py-2 text-gray-300 hover:text-(--pink) transition"
    : "text-gray-300 hover:text-(--pink) transition text-sm lg:text-base xl:text-lg whitespace-nowrap";

  const wrapperClass = isMobile 
    ? "flex flex-col gap-2"
    : "flex items-center gap-3 lg:gap-4 xl:gap-6";

  return (
    <div className={wrapperClass}>
      <Link href="/products" className={linkClass} onClick={handleClick}>Каталог</Link>
      <Link href="/about" className={linkClass} onClick={handleClick}>О нас</Link>
      <Link href="/contacts" className={linkClass} onClick={handleClick}>Контакты</Link>
      <Link href="/delivery" className={linkClass} onClick={handleClick}>Доставка</Link>
      {isAdmin && (
        <Link href="/admin" className={`${linkClass} text-purple-400 hover:text-purple-300`} onClick={handleClick}>
          Админка
        </Link>
      )}
      {isLoggedIn && (
        <Link href="/profile" className={linkClass} onClick={handleClick}>
          Профиль
        </Link>
      )}
    </div>
  );
}