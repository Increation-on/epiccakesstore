'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export default function TestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Тестовая страница</h1>
      
      {/* Кнопки */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Кнопки</h2>
        <div className="flex gap-4 flex-wrap">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* Карточки */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Карточки</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <h3 className="font-semibold text-gray-900">Товар 1</h3>
            <p className="text-gray-600">Описание товара</p>
            <p className="text-lg font-bold mt-2">500 ₽</p>
            <Button size="sm" className="mt-2">В корзину</Button>
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900">Товар 2</h3>
            <p className="text-gray-600">Описание товара</p>
            <p className="text-lg font-bold mt-2">750 ₽</p>
            <Button size="sm" className="mt-2">В корзину</Button>
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900">Товар 3</h3>
            <p className="text-gray-600">Описание товара</p>
            <p className="text-lg font-bold mt-2">1000 ₽</p>
            <Button size="sm" className="mt-2">В корзину</Button>
          </Card>
        </div>
      </section>

      {/* Инпуты */}
      <section className="max-w-md">
        <h2 className="text-xl font-semibold mb-4">Форма</h2>
        <Input label="Имя" placeholder="Введите имя" />
        <Input label="Email" type="email" placeholder="test@mail.com" />
        <Input 
          label="Пароль" 
          type="password" 
          error="Слишком короткий"
        />
      </section>

      {/* Модалка */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Модальное окно</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          Открыть модалку
        </Button>
        
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Тестовое окно"
        >
          <p>Это содержимое модального окна</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Ок
            </Button>
          </div>
        </Modal>
      </section>
    </div>
  );
}