// src/components/layout/Header.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import Logo from '@/components/ui/Logo'
import { CartIcon } from '../features/cart/CartIcon'
import { Button } from '../ui/Button'
import Navbar from './Navbar'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isAdmin = session?.user?.role === 'admin'
  const isLoggedIn = status === 'authenticated'

  return (
    <header className="bg-neutral-900 shadow-sm sticky top-0 z-50 border-b border-gray-800">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Лого */}
          <div className="shrink-0">
            <Logo />
          </div>

          {/* Навигация — только десктоп */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <Navbar isAdmin={isAdmin} isLoggedIn={isLoggedIn} />
          </div>

          {/* Правая часть */}
          <div className="flex items-center gap-2 shrink-0">
            <CartIcon />

            {/* Десктопный профиль */}
            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <Link href="/profile" className="flex items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-(--mint) flex items-center justify-center text-(--text)">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-gray-300 hidden xl:inline">
                      {session.user?.name || 'Профиль'}
                    </span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => signOut()}>Выйти</Button>
                </>
              ) : (
                <>
                  <Link href="/login"><Button variant="outline" size="sm">Войти</Button></Link>
                  <Link href="/register"><Button size="sm">Регистрация</Button></Link>
                </>
              )}
            </div>

            {/* Бургер */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-(--pink)"
              aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
            >
              {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-800">
            <Navbar isAdmin={isAdmin} isLoggedIn={isLoggedIn} isMobile onLinkClick={() => setIsMenuOpen(false)} />

            <div className="mt-4 pt-4 border-t border-gray-800">
              {isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-(--mint) flex items-center justify-center text-(--text)">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-gray-300">{session.user?.name || 'Профиль'}</span>
                  </div>
                  <Button variant='ghost' onClick={() => { signOut(); setIsMenuOpen(false); }} className="w-full">
                    Выйти
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}><Button variant="outline" className="w-full">Войти</Button></Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}><Button className="w-full">Регистрация</Button></Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}