"use client"

import Link from 'next/link';

type NavbarProps = {
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export default function Navbar({ isAdmin, isLoggedIn }: NavbarProps) {
  return (
    <nav className="flex gap-4 mx-auto px-4 py-3">
      <Link href="/products" className="text-gray-300 hover:text-(--pink) transition">
        Каталог
      </Link>
      <Link href="/about" className="text-gray-300 hover:text-(--pink) transition">
        О нас
      </Link>
      <Link href="/contacts" className="text-gray-300 hover:text-(--pink) transition">
        Контакты
      </Link>

      {isAdmin && (
        <Link href="/admin" className="text-purple-400 hover:text-purple-300 transition">
          Админка
        </Link>
      )}

      {isLoggedIn && (
        <Link href="/profile" className="text-gray-300 hover:text-(--pink) transition">
          Профиль
        </Link>
      )}
    </nav>
  );
}