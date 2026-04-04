'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cart.store';
import { useSession } from 'next-auth/react';

export function useCartSync() {
  const { data: session, status } = useSession();
  const { setItems, clearCart, items } = useCartStore();
  const hasSynced = useRef(false);

  // Загрузка с сервера при входе (один раз)
  useEffect(() => {
    const syncCart = async () => {
      if (hasSynced.current) return;
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const serverCart = await res.json();
            setItems(serverCart);
            hasSynced.current = true;
          }
        } catch (error) {
          console.error('Sync error:', error);
        }
      }
    };
    syncCart();
  }, [status, session?.user?.id, setItems]);

  // Очистка при выходе
  useEffect(() => {
    if (status === 'unauthenticated') {
      clearCart();
      hasSynced.current = false;
    }
  }, [status, clearCart]);
}