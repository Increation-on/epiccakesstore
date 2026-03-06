// src/components/Navbar.tsx
import Link from 'next/link';
import { AuthStatus } from '../auth/AuthStatus';
import { CartIcon } from '../features/CartIcon' // путь может отличаться
import { useCartStore } from '@/store/cart.store'

if (typeof window !== 'undefined') {
  (window as any).cartStore = useCartStore;
}
export default function Navbar() {
  return (
    <nav className="bg-gray-100 p-4 mb-4">
      <div className="container mx-auto flex gap-4">
        <Link href="/" className="hover:text-blue-600 text-gray-700">Главная</Link>
        <Link href="/products" className="hover:text-blue-600 text-gray-700">Каталог</Link>
        <Link href="/profile" className="hover:text-blue-600 text-gray-700">Профиль</Link>
        <CartIcon />
        <div className="ml-auto">
          <AuthStatus />
        </div>
      </div>
    </nav>
  );
}