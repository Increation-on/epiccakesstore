'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import Logo from '@/components/ui/Logo'
import { CartIcon } from '../features/cart/CartIcon'
import { Button } from '../ui/Button'
import Navbar from './Navbar'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isAdmin = session?.user?.role === 'admin'
  const isLoggedIn = !!session

  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

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
          <div className="flex items-center gap-6 shrink-0">
            <CartIcon />

            <div className="hidden md:flex items-center gap-6">
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

        {/* 🔥 Мобильное меню — выпадающий блок под хедером, поверх контента */}
        {isMenuOpen && (
          <div className="relative md:hidden">
            {/* Затемнение только под меню */}
            <div
              className="fixed inset-x-0 top-[calc(100%+1px)] bottom-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Мобильное меню — на всю ширину экрана */}
            <div
              ref={menuRef}
              className="absolute left-1/2 transform -translate-x-1/2 w-screen top-full mt-3.5 bg-neutral-900/95 backdrop-blur-sm border border-gray-800 rounded-b-lg shadow-xl z-50"
              style={{ maxWidth: '100vw' }}
            >
              <div className="p-4">
                <Navbar
                  isAdmin={isAdmin}
                  isLoggedIn={isLoggedIn}
                  isMobile
                  onLinkClick={() => setIsMenuOpen(false)}
                />

                <div className="mt-4 pt-4 border-t border-gray-800">
                  {isLoggedIn ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-(--mint) flex items-center justify-center text-(--text)">
                          {session.user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-gray-300">{session.user?.name || 'Профиль'}</span>
                      </div>
                      <Button
                        variant='outline'
                        onClick={() => { signOut(); setIsMenuOpen(false); }}
                        className="w-full"
                      >
                        Выйти
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full">Войти</Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full">Регистрация</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}