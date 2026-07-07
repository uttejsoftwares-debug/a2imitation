'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Category = { id: string; name: string; slug: string };
export type Product = {
  id: string;
  name: string;
  slug?: string;
  price: number;
  description?: string;
  sku?: string;
  stock?: number;
  category?: Category;
  images?: Array<{ url: string }>;
  isFeatured?: boolean;
  isNew?: boolean;
};

export type CartItem = Product & { quantity: number };

type AppContextValue = {
  cart: CartItem[];
  wishlist: Product[];
  total: number;
  cartCount: number;
  wishlistCount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const CART_KEY = 'a2_cart';
const WISHLIST_KEY = 'a2_wishlist';

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedCart = window.localStorage.getItem(CART_KEY);
      const storedWishlist = window.localStorage.getItem(WISHLIST_KEY);
      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    } catch {
      setCart([]);
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const wishlistCount = wishlist.length;

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((current) =>
      current
        .map((item) => (item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => setCart([]);

  const addToWishlist = (product: Product) => {
    setWishlist((current) => {
      if (current.some((item) => item.id === product.id)) return current;
      return [...current, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((current) => current.filter((item) => item.id !== productId));
  };

  const isWishlisted = (productId: string) => wishlist.some((item) => item.id === productId);

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        total,
        cartCount,
        wishlistCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
