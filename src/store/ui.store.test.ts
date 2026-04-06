import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './ui.store';

describe('ui.store', () => {
  beforeEach(() => {
    // Сбрасываем состояние перед каждым тестом
    useUIStore.setState({
      theme: 'light',
      sidebarOpen: false,
      modalStack: [],
    });
  });

  describe('initial state', () => {
    it('должен иметь тему light по умолчанию', () => {
      const { theme } = useUIStore.getState();
      expect(theme).toBe('light');
    });

    it('должен иметь sidebar закрытым по умолчанию', () => {
      const { sidebarOpen } = useUIStore.getState();
      expect(sidebarOpen).toBe(false);
    });

    it('должен иметь пустой стек модалок по умолчанию', () => {
      const { modalStack } = useUIStore.getState();
      expect(modalStack).toEqual([]);
    });
  });

  describe('toggleTheme', () => {
    it('переключает тему с light на dark', () => {
      const { toggleTheme } = useUIStore.getState();
      
      toggleTheme();
      
      const { theme } = useUIStore.getState();
      expect(theme).toBe('dark');
    });

    it('переключает тему с dark на light', () => {
      useUIStore.setState({ theme: 'dark' });
      const { toggleTheme } = useUIStore.getState();
      
      toggleTheme();
      
      const { theme } = useUIStore.getState();
      expect(theme).toBe('light');
    });
  });

  describe('toggleSidebar', () => {
    it('открывает закрытый sidebar', () => {
      const { toggleSidebar } = useUIStore.getState();
      
      toggleSidebar();
      
      const { sidebarOpen } = useUIStore.getState();
      expect(sidebarOpen).toBe(true);
    });

    it('закрывает открытый sidebar', () => {
      useUIStore.setState({ sidebarOpen: true });
      const { toggleSidebar } = useUIStore.getState();
      
      toggleSidebar();
      
      const { sidebarOpen } = useUIStore.getState();
      expect(sidebarOpen).toBe(false);
    });
  });

  describe('openModal', () => {
    it('добавляет модалку в стек', () => {
      const { openModal } = useUIStore.getState();
      
      openModal('modal-1');
      
      const { modalStack } = useUIStore.getState();
      expect(modalStack).toEqual(['modal-1']);
    });

    it('добавляет несколько модалок в стек', () => {
      const { openModal } = useUIStore.getState();
      
      openModal('modal-1');
      openModal('modal-2');
      openModal('modal-3');
      
      const { modalStack } = useUIStore.getState();
      expect(modalStack).toEqual(['modal-1', 'modal-2', 'modal-3']);
    });
  });

  describe('closeModal', () => {
    it('удаляет последнюю модалку из стека', () => {
      useUIStore.setState({ modalStack: ['modal-1', 'modal-2', 'modal-3'] });
      const { closeModal } = useUIStore.getState();
      
      closeModal();
      
      const { modalStack } = useUIStore.getState();
      expect(modalStack).toEqual(['modal-1', 'modal-2']);
    });

    it('не падает при закрытии из пустого стека', () => {
      const { closeModal } = useUIStore.getState();
      
      expect(() => closeModal()).not.toThrow();
      
      const { modalStack } = useUIStore.getState();
      expect(modalStack).toEqual([]);
    });
  });
});