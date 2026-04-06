import { describe, it, expect, beforeEach } from 'vitest';
import { useCurrencyStore, Currency } from './currency.store';

describe('currency.store', () => {
  beforeEach(() => {
    useCurrencyStore.setState({ currency: 'BYN' });
  });

  describe('initial state', () => {
    it('должен иметь валюту BYN по умолчанию', () => {
      const { currency } = useCurrencyStore.getState();
      expect(currency).toBe('BYN');
    });
  });

  describe('setCurrency', () => {
    it('должен переключать валюту на RUB', () => {
      const { setCurrency } = useCurrencyStore.getState();
      
      setCurrency('RUB');
      
      const { currency } = useCurrencyStore.getState();
      expect(currency).toBe('RUB');
    });

    it('должен переключать валюту на USD', () => {
      const { setCurrency } = useCurrencyStore.getState();
      
      setCurrency('USD');
      
      const { currency } = useCurrencyStore.getState();
      expect(currency).toBe('USD');
    });

    it('должен переключать валюту на EUR', () => {
      const { setCurrency } = useCurrencyStore.getState();
      
      setCurrency('EUR');
      
      const { currency } = useCurrencyStore.getState();
      expect(currency).toBe('EUR');
    });

    it('должен переключать валюту обратно на BYN', () => {
      const { setCurrency } = useCurrencyStore.getState();
      
      setCurrency('USD');
      setCurrency('BYN');
      
      const { currency } = useCurrencyStore.getState();
      expect(currency).toBe('BYN');
    });
  });
});