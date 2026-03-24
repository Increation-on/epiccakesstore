'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cart.store'
import { useEffect, useState } from 'react'

export const CartIcon = () => {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore(state => state.items)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Защита: если items не массив или нет, то 0
  const total = Array.isArray(items) 
    ? items.reduce((sum, item) => sum + (item?.quantity || 0), 0)
    : 0
  
  if (!mounted) return null
  
  return (
    <Link href="/cart" className="relative p-2">
      🛒
      {total > 0 && (
        <span className="absolute -top-1 -right-1 bg-(--pink-dark) text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {total}
        </span>
      )}
    </Link>
  )
}