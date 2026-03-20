"use client"

import Link from 'next/link';

type NavbarProps = {
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export default function Navbar({ isAdmin, isLoggedIn }: NavbarProps) {
  return (
    <nav className="flex gap-4 mx-auto px-4 py-3 font-sans">
      <Link href="/products" className="hover:text-(--pink) transition">
        Каталог
      </Link>
      <Link href="/about" className="hover:text-(--pink) transition">
        О нас
      </Link>
      <Link href="/contacts" className="hover:text-(--pink) transition">
        Контакты
      </Link>

      {isAdmin && (
        <Link
          href="/admin"
          className="text-(--admin) hover:text-(--admin-dark) transition"
        >
          🔧 Админка
        </Link>
      )}

      {isLoggedIn && (
        <Link href="/profile" className="hover:text-(--pink) transition">
          Профиль
        </Link>
      )}
    </nav>
  );
}