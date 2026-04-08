/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { useCartStore } from '@/store/cart.store';
import { Product } from '@/types/domain/product.types';

// Мокаем зависимости
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    status: 'authenticated',
  }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, className }: any) => <img src={src} alt={alt} className={className} />,
}));

vi.mock('@/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} data-size={size} className={className}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/Price', () => ({
  Price: ({ price }: any) => <span>{price} Br</span>,
}));

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

const mockProduct: Product = {
  id: '1',
  name: 'Тестовый торт',
  description: 'Вкусный торт',
  price: 500,
  inStock: true,
  stock: 10,
  images: '["/test.jpg"]',
  isArchived: false,
  categories: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  archivedAt: null,
};

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({ items: [], isAuthenticated: true });
  });

  it('отображает название товара', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Тестовый торт')).toBeDefined();
  });

  it('отображает цену товара', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('500 Br')).toBeDefined();
  });

  it('отображает описание товара', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Вкусный торт')).toBeDefined();
  });

  it('показывает кнопку "В корзину" для авторизованных', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('В корзину')).toBeDefined();
  });

  it('вызывает addItem при клике на кнопку "В корзину"', async () => {
    const addItemMock = vi.fn();
    useCartStore.setState({ addItem: addItemMock });
    
    render(<ProductCard product={mockProduct} />);
    
    const button = screen.getByText('В корзину');
    fireEvent.click(button);
    
    expect(addItemMock).toHaveBeenCalledWith('1', 1);
  });
});