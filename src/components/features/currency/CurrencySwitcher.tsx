'use client'

import { useState } from 'react'
import { useCurrencyStore, Currency } from '@/store/currency.store'
import { Button } from '@/components/ui/Button'

const currencies: { code: Currency; label: string; symbol: string }[] = [
  { code: 'BYN', label: 'BYN', symbol: 'Br' },
  { code: 'RUB', label: 'RUB', symbol: '₽' },
  { code: 'USD', label: 'USD', symbol: '$' },
  { code: 'EUR', label: 'EUR', symbol: '€' },
]

export const CurrencySwitcher = () => {
  const { currency, setCurrency } = useCurrencyStore()
  const [isOpen, setIsOpen] = useState(false)

  const currentCurrency = currencies.find(c => c.code === currency)

  return (
    <div className="relative">
      {/* Кнопка-триггер */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-300 hover:text-(--pink) transition"
      >
        <span>{currentCurrency?.symbol}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Выпадающий список */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  setCurrency(curr.code)
                  setIsOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-(--mint) transition first:rounded-t-lg last:rounded-b-lg ${
                  currency === curr.code
                    ? 'text-(--pink) font-medium bg-gray-50'
                    : 'text-gray-700'
                }`}
              >
                <span className="inline-block w-8">{curr.symbol}</span>
                <span className="ml-2">{curr.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}