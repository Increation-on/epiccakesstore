import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from './cart.store';

// Мокаем fetch глобально
const mockFetch = vi.fn();

beforeEach(() => {
  useCartStore.setState({ items: [] });
  vi.clearAllMocks();
  global.fetch = mockFetch;
});

describe('cart.store', () => {
  describe('addItem', () => {
    it('добавляет новый товар в корзину', async () => {
      // Мокаем успешный ответ от /api/products/by-ids
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 'product-1', stock: 10, isArchived: false, name: 'Тест' }]
      });
      
      // Мокаем успешный ответ от /api/cart
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const { addItem } = useCartStore.getState();
      
      await addItem('product-1', 1);
      
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe('product-1');
      expect(items[0].quantity).toBe(1);
    });

    it('увеличивает количество существующего товара', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'product-1', stock: 10, isArchived: false, name: 'Тест' }]
      });

      const { addItem } = useCartStore.getState();
      
      await addItem('product-1', 1);
      await addItem('product-1', 2);
      
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(3);
    });

    it('создаёт уникальный id для каждого товара', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'product-1', stock: 10, isArchived: false, name: 'Тест' }]
      });

      const { addItem } = useCartStore.getState();
      
      await addItem('product-1', 1);
      await addItem('product-2', 1);
      
      const { items } = useCartStore.getState();
      expect(items[0].id).not.toBe(items[1].id);
    });
  });

  describe('removeItem', () => {
    it('удаляет товар по id', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'product-1', stock: 10, isArchived: false, name: 'Тест' }]
      });

      const { addItem, removeItem } = useCartStore.getState();
      
      await addItem('product-1', 1);
      await addItem('product-2', 1);
      
      const firstItemId = useCartStore.getState().items[0].id;
      removeItem(firstItemId);
      
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe('product-2');
    });
  });

  describe('updateQuantity', () => {
    it('обновляет количество товара', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'product-1', stock: 10, isArchived: false, name: 'Тест' }]
      });

      const { addItem, updateQuantity } = useCartStore.getState();
      
      await addItem('product-1', 1);
      const itemId = useCartStore.getState().items[0].id;
      
      updateQuantity(itemId, 5);
      
      const { items } = useCartStore.getState();
      expect(items[0].quantity).toBe(5);
    });
  });

  describe('clearCart', () => {
    it('очищает всю корзину', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'product-1', stock: 10, isArchived: false, name: 'Тест' }]
      });

      const { addItem, clearCart } = useCartStore.getState();
      
      await addItem('product-1', 1);
      await addItem('product-2', 1);
      
      clearCart();
      
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(0);
    });
  });

  describe('setItems', () => {
    it('устанавливает корзину из массива', () => {
      const { setItems } = useCartStore.getState();
      
      const newItems = [
        { id: '1', productId: 'p1', quantity: 2, addedAt: new Date().toISOString() },
        { id: '2', productId: 'p2', quantity: 1, addedAt: new Date().toISOString() },
      ];
      
      setItems(newItems);
      
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(2);
      expect(items[0].productId).toBe('p1');
    });
  });

  describe('totalItems', () => {
    it('считает общее количество товаров', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'product-1', stock: 10, isArchived: false, name: 'Тест' }]
      });

      const { addItem } = useCartStore.getState();
      
      await addItem('product-1', 2);
      await addItem('product-2', 3);
      
      const { items } = useCartStore.getState();
      const calculatedTotal = items.reduce((sum, item) => sum + item.quantity, 0);
      
      expect(items).toHaveLength(2);
      expect(calculatedTotal).toBe(5);
    });
  });
});