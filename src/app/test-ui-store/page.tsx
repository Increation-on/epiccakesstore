'use client';

import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function TestUIStorePage() {
  const { 
    theme, 
    sidebarOpen, 
    modalStack,
    toggleTheme, 
    toggleSidebar,
    openModal,
    closeModal
  } = useUIStore();

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Тест UI Store</h1>

      {/* Тема */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Тема</h2>
        <p>Текущая тема: <span className="font-bold">{theme}</span></p>
        <Button onClick={toggleTheme} className="mt-2">
          Сменить тему
        </Button>
      </Card>

      {/* Сайдбар */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Сайдбар</h2>
        <p>Сайдбар: <span className="font-bold">{sidebarOpen ? 'открыт' : 'закрыт'}</span></p>
        <Button onClick={toggleSidebar} className="mt-2">
          {sidebarOpen ? 'Закрыть' : 'Открыть'} сайдбар
        </Button>
      </Card>

      {/* Модалки */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Модалки</h2>
        <p>Стек модалок: <span className="font-bold">{modalStack.join(' → ') || 'пусто'}</span></p>
        <div className="flex gap-2 mt-2">
          <Button onClick={() => openModal('modal1')}>Открыть modal1</Button>
          <Button onClick={() => openModal('modal2')}>Открыть modal2</Button>
          <Button onClick={closeModal}>Закрыть последнюю</Button>
        </div>
      </Card>
    </div>
  );
}