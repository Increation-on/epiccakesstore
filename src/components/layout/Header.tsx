// src/components/layout/Header.tsx
"use client"

import Link from 'next/link';
import Image from 'next/image';
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
        <header className="bg-white shadow-sm sticky top-0 z-50 font-sans">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">

                    {/* Лого слева */}
                    <Logo />

                    {/* Навигация по центру */}
                    <Navbar isAdmin={isAdmin} isLoggedIn={isLoggedIn} />

                    {/* Правая часть */}
                    <div className="flex items-center gap-4">
                        <CartIcon />

                        {isLoggedIn ? (
                            <div className="flex items-center gap-3">
                                <Link href="/profile" className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                        {session.user?.name?.[0] || 'U'}
                                    </div>
                                    <span className="hidden sm:inline text-sm font-medium">
                                        {session.user?.name || 'Профиль'}
                                    </span>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => signOut()}
                                >
                                    Выйти
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Link href="/login">Войти</Link>
                                </Button>
                                <Button size="sm">
                                    <Link href="/register">Регистрация</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}