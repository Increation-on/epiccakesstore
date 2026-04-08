/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CartContent from './CartContent';

// Мокаем useCartStore ДО импорта компонента
const mockItems: never[] = [];
const mockRemoveItem = vi.fn();
const mockUpdateQuantity = vi.fn();
const mockClearCart = vi.fn();

vi.mock('@/store/cart.store', () => ({
  useCartStore: () => ({
    items: mockItems,
    removeItem: mockRemoveItem,
    updateQuantity: mockUpdateQuantity,
    clearCart: mockClearCart,
  }),
}));

// Мокаем остальные зависимости
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

vi.mock('next/image', () => ({
  default: () => React.createElement('img', { alt: 'mock' }),
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children }: any) => React.createElement('button', null, children),
}));

vi.mock('@/components/ui/Price', () => ({
  Price: () => React.createElement('span', null, '0 Br'),
}));

vi.mock('@/components/features/skeleton/CartSkeleton', () => ({
  default: () => React.createElement('div', null, 'Loading...'),
}));

vi.mock('@/components/ui/Modal', () => ({
  Modal: () => null,
}));

vi.mock('@/components/features/products/ProductStockStatus', () => ({
  ProductStockStatus: () => React.createElement('span', null, 'В наличии'),
}));

describe('CartContent', () => {
  it('рендерит пустую корзину', () => {
    render(React.createElement(CartContent));
    expect(screen.getByText('Корзина пуста')).toBeDefined();
  });
});