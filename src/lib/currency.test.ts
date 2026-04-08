import { describe, it, expect } from 'vitest';
import { formatPrice, exchangeRates, currencySymbols } from './currency';

describe('currency', () => {
  describe('exchangeRates', () => {
    it('должен содержать все валюты', () => {
      expect(exchangeRates).toHaveProperty('BYN');
      expect(exchangeRates).toHaveProperty('RUB');
      expect(exchangeRates).toHaveProperty('USD');
      expect(exchangeRates).toHaveProperty('EUR');
    });

    it('курс BYN должен быть 1', () => {
      expect(exchangeRates.BYN).toBe(1);
    });

    it('курс RUB должен быть 28', () => {
      expect(exchangeRates.RUB).toBe(28);
    });

    it('курс USD должен быть 0.29', () => {
      expect(exchangeRates.USD).toBe(0.29);
    });

    it('курс EUR должен быть 0.27', () => {
      expect(exchangeRates.EUR).toBe(0.27);
    });
  });

  describe('currencySymbols', () => {
    it('должен содержать все валюты', () => {
      expect(currencySymbols).toHaveProperty('BYN');
      expect(currencySymbols).toHaveProperty('RUB');
      expect(currencySymbols).toHaveProperty('USD');
      expect(currencySymbols).toHaveProperty('EUR');
    });

    it('символ BYN должен быть "Br"', () => {
      expect(currencySymbols.BYN).toBe('Br');
    });

    it('символ RUB должен быть "₽"', () => {
      expect(currencySymbols.RUB).toBe('₽');
    });

    it('символ USD должен быть "$"', () => {
      expect(currencySymbols.USD).toBe('$');
    });

    it('символ EUR должен быть "€"', () => {
      expect(currencySymbols.EUR).toBe('€');
    });
  });

  describe('formatPrice', () => {
    it('конвертирует BYN в BYN (100 → "100 Br")', () => {
      expect(formatPrice(100, 'BYN')).toBe('100 Br');
    });

    it('конвертирует BYN в RUB (100 → "2800 ₽")', () => {
      expect(formatPrice(100, 'RUB')).toBe('2800 ₽');
    });

    it('конвертирует BYN в USD (100 → "29 $")', () => {
      expect(formatPrice(100, 'USD')).toBe('29 $');
    });

    it('конвертирует BYN в EUR (100 → "27 €")', () => {
      expect(formatPrice(100, 'EUR')).toBe('27 €');
    });

    it('округляет до 2 знаков (10.50 BYN → "10.5 Br")', () => {
      expect(formatPrice(10.5, 'BYN')).toBe('10.5 Br');
    });

    it('обрабатывает дробные значения (0.5 BYN → "0.5 Br")', () => {
      expect(formatPrice(0.5, 'BYN')).toBe('0.5 Br');
    });
  });
});