// src/components/Navbar.tsx
import Link from 'next/link';
import { AuthStatus } from '../auth/AuthStatus'; // путь может отличаться

export default function Navbar() {
  return (
    <nav className="bg-gray-100 p-4 mb-4">
      <div className="container mx-auto flex gap-4">
        <Link href="/" className="hover:text-blue-600 text-gray-700">Главная</Link>
        <Link href="/products" className="hover:text-blue-600 text-gray-700">Каталог</Link>
        <Link href="/profile" className="hover:text-blue-600 text-gray-700">Профиль</Link>
        <div className="ml-auto">
          <AuthStatus />
        </div>
      </div>
    </nav>
  );
}