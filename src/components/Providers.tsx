'use client';

import React from 'react';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/components/Toast';
import { CartDrawer } from '@/components/CartDrawer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ToastProvider>
        {children}
        <CartDrawer />
      </ToastProvider>
    </CartProvider>
  );
}
