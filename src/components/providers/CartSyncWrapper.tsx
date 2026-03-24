// src/components/providers/CartSyncWrapper.tsx
'use client';

import { useCartSync } from '@/hooks/useCartSync';

export default function CartSyncWrapper() {
  useCartSync();
  return null;
}