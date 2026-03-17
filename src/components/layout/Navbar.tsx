// src/components/Navbar.tsx
"use client"

import Link from 'next/link';
import { AuthStatus } from '../auth/AuthStatus';
import { CartIcon } from '../features/cart/CartIcon';
import { useCartStore } from '@/store/cart.store'
import { useSession } from 'next-auth/react';

// Это для отладки (можно оставить)
if (typeof window !== 'undefined') {
  (window as any).cartStore = useCartStore;
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  return (
    <nav className="bg-gray-100 p-4 mb-4">
      <div className="container mx-auto flex gap-4 items-center">
        <Link href="/" className="hover:text-blue-600 text-gray-700">
          Главная
        </Link>
        <Link href="/products" className="hover:text-blue-600 text-gray-700">
          Каталог
        </Link>
        <Link href="/profile" className="hover:text-blue-600 text-gray-700">
          Профиль
        </Link>
        
        {/* 👇 Ссылка на админку (только для админов) */}
        {isAdmin && (
          <Link 
            href="/admin" 
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            Админка
          </Link>
        )}
        
        <CartIcon />
        
        <div className="ml-auto">
          <AuthStatus />
        </div>
      </div>
    </nav>
  );
}