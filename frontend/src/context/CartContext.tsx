'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface CartItemType {
  id: string;
  productId: string;
  name: string;
  nameHi?: string;
  slug: string;
  image: string;
  variantId?: string | null;
  variantSize?: string | null;
  variantColor?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  inStock: boolean;
  availableStock: number;
}

interface CartContextType {
  items: CartItemType[];
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, variantId?: string | null, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getCart();
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setTotalItems(res.data.totalItems || 0);
        setSubtotal(res.data.subtotal || 0);
      }
    } catch (e) {
      console.warn('Failed to fetch cart:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = async (productId: string, variantId?: string | null, quantity = 1) => {
    try {
      setIsLoading(true);
      const res = await api.addToCart(productId, variantId, quantity);
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setTotalItems(res.data.totalItems || 0);
        setSubtotal(res.data.subtotal || 0);
        setIsCartOpen(true); // Open drawer on addition
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      const res = await api.updateCartQuantity(itemId, quantity);
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setTotalItems(res.data.totalItems || 0);
        setSubtotal(res.data.subtotal || 0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      const res = await api.removeCartItem(itemId);
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setTotalItems(res.data.totalItems || 0);
        setSubtotal(res.data.subtotal || 0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      await api.clearCart();
      setItems([]);
      setTotalItems(0);
      setSubtotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isLoading,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
