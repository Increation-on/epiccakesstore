import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Currency = 'BYN' | 'RUB' | 'USD' | 'EUR'

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