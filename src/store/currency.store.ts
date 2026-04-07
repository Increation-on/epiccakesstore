// store/currency.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Currency } from '@/lib/currency'  // ← импортируем из lib, не объявляем новый

interface CurrencyStore {
  currency: Currency
  setCurrency: (currency: Currency) => void
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: 'BYN',
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'currency-storage',
    }
  )
)