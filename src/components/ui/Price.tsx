'use client'

import { useCurrencyStore } from '@/store/currency.store'
import { formatPrice } from '@/lib/currency'

interface PriceProps {
  price: number // цена в BYN
  className?: string
}

export const Price = ({ price, className }: PriceProps) => {
  const { currency } = useCurrencyStore()
  
  return <span className={className}>{formatPrice(price, currency)}</span>
}