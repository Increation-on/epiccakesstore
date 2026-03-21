// src/components/layout/Header.tsx
"use client"

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { CartIcon } from '../features/cart/CartIcon';
import { Button } from '../ui/Button';
import Navbar from './Navbar';
import Logo from '../ui/Logo';

export default function Header() {
    const { data: session, status } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const isLoggedIn = status === 'authenticated';

    return (
        <header className="bg-neutral-900 shadow-sm sticky top-0 z-50 border-b border-gray-800">
            <div className="container mx-auto px-4 py-3 sm:max-w-none">
                <div className="flex items-center justify-between relative">

                    {/* Лого */}
                    <div className="w-32">
                        <Logo />
                    </div>

                    {/* Навигация */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <Navbar isAdmin={isAdmin} isLoggedIn={isLoggedIn} />
                    </div>

                    {/* Правая часть */}
                    <div className="w-32 flex justify-end gap-4">
                        <CartIcon />

                        {isLoggedIn ? (
                            <div className="flex items-center gap-3">
                                <Link href="/profile" className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-(--mint) flex items-center justify-center text-(--text) shrink-0">
                                        {session.user?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden sm:inline text-sm text-gray-300 whitespace-nowrap">
                                        {session.user?.name || 'Профиль'}
                                    </span>
                                </Link>
                                <Button variant="outline" size="sm" onClick={() => signOut()}>
                                    Выйти
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link href="/login">
                                    <Button variant="outline" size="sm">Войти</Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Регистрация</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}