import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  modalStack: string[];
  
  toggleTheme: () => void;
  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  sidebarOpen: false,
  modalStack: [],
  
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  openModal: (id) => set((state) => ({ 
    modalStack: [...state.modalStack, id] 
  })),
  
  closeModal: () => set((state) => ({ 
    modalStack: state.modalStack.slice(0, -1) 
  })),
}));