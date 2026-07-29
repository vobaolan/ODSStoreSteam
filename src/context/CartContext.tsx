'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  coverImage: string;
  quantity: number;
  platform: string;
  productId: string;
  variantName?: string;
}

export interface Coupon {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
  coupon: Coupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  getDiscountAmount: () => number;
  getNetAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('kami_steam_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart data', e);
      }
    }
  }, []);

  // Save cart to localStorage on changes
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('kami_steam_cart', JSON.stringify(items));
  };

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      // For digital keys/accounts, limit quantity to inventory, but we default to incrementing
      const updatedItems = cartItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      saveCart(updatedItems);
    } else {
      saveCart([...cartItems, { ...product, quantity: 1 }]);
    }
    setCartOpen(true); // Open cart drawer on add
  };

  const removeFromCart = (id: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== id);
    saveCart(updatedItems);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const updatedItems = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    saveCart(updatedItems);
  };

  const clearCart = () => {
    saveCart([]);
    setCoupon(null);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cartItems.reduce((total, item) => {
    const activePrice = item.discountPrice ?? item.price;
    return total + activePrice * item.quantity;
  }, 0);

  const applyCoupon = async (code: string): Promise<boolean> => {
    const cleanedCode = code.toUpperCase().trim();

    // Read active coupons from localStorage (or fallback defaults on first run)
    let couponsList: any[] = [];
    try {
      const stored = localStorage.getItem('ods_admin_coupons');
      if (stored) {
        couponsList = JSON.parse(stored);
      } else {
        couponsList = [
          { id: 'cp-1', code: 'ODSSTORE', discountType: 'PERCENT', discountValue: 20, usageLimit: 999, usedCount: 12, status: 'ACTIVE' },
          { id: 'cp-2', code: 'ODS100K', discountType: 'FIXED', discountValue: 100000, usageLimit: 500, usedCount: 8, status: 'ACTIVE' },
        ];
        localStorage.setItem('ods_admin_coupons', JSON.stringify(couponsList));
      }
    } catch (e) {
      console.error('Failed to read admin coupons in CartContext:', e);
    }

    // Strictly match code against live admin coupons list
    const found = couponsList.find(
      (c) => c.code.toUpperCase() === cleanedCode && c.status !== 'EXPIRED'
    );

    if (found) {
      setCoupon({
        code: found.code,
        discountType: found.discountType,
        discountValue: found.discountValue,
      });
      return true;
    }

    return false;
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const getDiscountAmount = () => {
    if (!coupon) return 0;
    if (coupon.discountType === 'PERCENT') {
      return (cartTotal * coupon.discountValue) / 100;
    } else {
      return Math.min(coupon.discountValue, cartTotal);
    }
  };

  const getNetAmount = () => {
    return Math.max(0, cartTotal - getDiscountAmount());
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setCartOpen,
        coupon,
        applyCoupon,
        removeCoupon,
        getDiscountAmount,
        getNetAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
