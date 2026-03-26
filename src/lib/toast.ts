import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string) => 
    sonnerToast.success(message, {
      style: {
        background: '#D1FAE5',
        color: '#1F2937',
        border: '1px solid #0cd4c5',
      },
      icon: '✅',
    }),
    
  error: (message: string) => 
    sonnerToast.error(message, {
      style: {
        background: '#FEE2E2',
        color: '#991B1B',
        border: '1px solid #EF4444',
      },
      icon: '❌',
    }),
    
  info: (message: string) => 
    sonnerToast(message, {
      style: {
        background: 'var(--background)',
        border: '1px solid var(--pink)',
      },
      icon: '🍰',
    }),
};