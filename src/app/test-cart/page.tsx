'use client';

import { useCartStore } from '@/store/cart.store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function TestCartPage() {
  const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCartStore();

  // Тестовые товары
  const products = [
    { id: 1, name: 'Кружка', price: 500 },
    { id: 2, name: 'Тарелка', price: 800 },
    { id: 3, name: 'Чайник', price: 1500 },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Тест корзины</h1>

      {/* Список товаров */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Товары</h2>
        <div className="space-y-2">
          {products.map(product => (
            <div key={product.id} className="flex justify-between items-center">
              <span>{product.name} - {product.price} ₽</span>
              <Button 
                size="sm" 
                onClick={() => addItem(product)}
              >
                В корзину
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Корзина */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Корзина</h2>
        {items.length === 0 ? (
          <p className="text-gray-500">Корзина пуста</p>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.price} ₽ × {item.quantity}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => removeItem(item.id)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-4 font-bold">
              <span>Итого:</span>
              <span>{total()} ₽</span>
            </div>
            
            <Button variant="secondary" onClick={clearCart}>
              Очистить корзину
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}