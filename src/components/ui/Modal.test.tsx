/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  beforeEach(() => {
    // Сбрасываем overflow после каждого теста
    document.body.style.overflow = '';
  });

  it('не рендерится когда isOpen = false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Содержимое</div>
      </Modal>
    );
    
    expect(screen.queryByText('Содержимое')).toBeNull();
  });

  it('рендерится когда isOpen = true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Содержимое</div>
      </Modal>
    );
    
    expect(screen.getByText('Содержимое')).toBeDefined();
  });

  it('отображает заголовок если передан', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Мой заголовок">
        <div>Содержимое</div>
      </Modal>
    );
    
    expect(screen.getByText('Мой заголовок')).toBeDefined();
  });

  it('не отображает заголовок если не передан', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Содержимое</div>
      </Modal>
    );
    
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('вызывает onClose при клике на фон', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Содержимое</div>
      </Modal>
    );
    
    const backdrop = document.querySelector('.bg-black\\/50');
    fireEvent.click(backdrop!);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('вызывает onClose при клике на кнопку закрытия', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Содержимое</div>
      </Modal>
    );
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('блокирует скролл body когда модалка открыта', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Содержимое</div>
      </Modal>
    );
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('восстанавливает скролл body когда модалка закрыта', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Содержимое</div>
      </Modal>
    );
    
    expect(document.body.style.overflow).toBe('hidden');
    
    unmount();
    
    expect(document.body.style.overflow).toBe('unset');
  });
});