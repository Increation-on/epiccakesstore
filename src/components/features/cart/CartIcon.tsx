'use client'

import { useCartStore } from '@/store/cart.store'
import Link from 'next/link'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'

export function CartIcon() {
  const items = useCartStore((state) => state.items)
  const itemCount = items.reduce((sum, item) => sum + (item?.quantity || 0), 0)

  return (
    <Link href="/cart" className="relative">
      <ShoppingCartIcon className="w-6 h-6 text-gray-300 hover:text-(--pink) transition" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-(--pink) text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  )
}