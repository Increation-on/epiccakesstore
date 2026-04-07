// lib/currency.ts

// Экспортируем тип
export type Currency = 'BYN' | 'RUB' | 'USD' | 'EUR'

// Курсы относительно BYN (1 BYN = X)
export const exchangeRates: Record<Currency, number> = {
  BYN: 1,
  RUB: 28,    // 1 BYN ≈ 28 RUB
  USD: 0.29,  // 1 BYN ≈ 0.29 USD
  EUR: 0.27,  // 1 BYN ≈ 0.27 EUR
}

export const currencySymbols: Record<Currency, string> = {
  BYN: 'Br',
  RUB: '₽',
  USD: '$',
  EUR: '€',
}

export const formatPrice = (priceInBYN: number, currency: Currency): string => {
  const rate = exchangeRates[currency]
  let value = priceInBYN * rate
  const rounded = Math.round(value * 100) / 100
  return `${rounded} ${currencySymbols[currency]}`
}

// Функция для конвертации (возвращает число)
export const convertPrice = (priceInBYN: number, targetCurrency: Currency): number => {
  const rate = exchangeRates[targetCurrency]
  const value = priceInBYN * rate
  return Math.round(value * 100) / 100
}