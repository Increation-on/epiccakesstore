/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Price } from './Price';
import { useCurrencyStore } from '@/store/currency.store';

describe('Price', () => {
  beforeEach(() => {
    // Сбрасываем валюту на BYN перед каждым тестом
    useCurrencyStore.setState({ currency: 'BYN' });
  });

  it('отображает цену в BYN по умолчанию', () => {
    render(<Price price={100} />);
    
    expect(screen.getByText('100 Br')).toBeDefined();
  });

  it('отображает цену в RUB', () => {
    useCurrencyStore.setState({ currency: 'RUB' });
    render(<Price price={100} />);
    
    expect(screen.getByText('2800 ₽')).toBeDefined();
  });

  it('отображает цену в USD', () => {
    useCurrencyStore.setState({ currency: 'USD' });
    render(<Price price={100} />);
    
    expect(screen.getByText('29 $')).toBeDefined();
  });

  it('отображает цену в EUR', () => {
    useCurrencyStore.setState({ currency: 'EUR' });
    render(<Price price={100} />);
    
    expect(screen.getByText('27 €')).toBeDefined();
  });

  it('применяет className', () => {
    render(<Price price={100} className="text-red-500" />);
    
    const element = screen.getByText('100 Br');
    expect(element.className).toContain('text-red-500');
  });

  it('пересчитывает цену при смене валюты', () => {
    const { rerender } = render(<Price price={100} />);
    
    expect(screen.getByText('100 Br')).toBeDefined();
    
    useCurrencyStore.setState({ currency: 'USD' });
    rerender(<Price price={100} />);
    
    expect(screen.getByText('29 $')).toBeDefined();
  });
});