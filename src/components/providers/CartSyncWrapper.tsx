'use client';

import { useCartSync } from '@/hooks/useCartSync';

export function CartSyncWrapper() {
  useCartSync();
  return null;
}