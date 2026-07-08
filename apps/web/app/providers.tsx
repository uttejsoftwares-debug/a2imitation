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
export type User = { id: string; email: string; name: string };

type AppContextValue = {
  cart: CartItem[];
  wishlist: Product[];
  user: User | null;
  isAuthenticated: boolean;
  total: number;
  cartCount: number;
  wishlistCount: number;
  addToCart: (product: Product) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => boolean;
  removeFromWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const CART_KEY = 'a2_cart';
const WISHLIST_KEY = 'a2_wishlist';
const USER_KEY = 'a2_user';

const getCartKey = (userId?: string) => (userId ? `${CART_KEY}_${userId}` : CART_KEY);
const getWishlistKey = (userId?: string) => (userId ? `${WISHLIST_KEY}_${userId}` : WISHLIST_KEY);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const loadUserStorage = (currentUser: User) => {
    if (typeof window === 'undefined') return;
    try {
      const storedCart = window.localStorage.getItem(getCartKey(currentUser.id));
      const storedWishlist = window.localStorage.getItem(getWishlistKey(currentUser.id));
      setCart(storedCart ? JSON.parse(storedCart) : []);
      setWishlist(storedWishlist ? JSON.parse(storedWishlist) : []);
    } catch {
      setCart([]);
      setWishlist([]);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedUser = window.localStorage.getItem(USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) {
      loadUserStorage(user);
      return;
    }

    try {
      const storedCart = window.localStorage.getItem(CART_KEY);
      const storedWishlist = window.localStorage.getItem(WISHLIST_KEY);
      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    } catch {
      setCart([]);
      setWishlist([]);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined' || user) return;
    try {
      const storedUser = window.localStorage.getItem(USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      }
    } catch {
      // ignore invalid stored user
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = getCartKey(user?.id);
    window.localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = getWishlistKey(user?.id);
    window.localStorage.setItem(key, JSON.stringify(wishlist));
  }, [wishlist, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const wishlistCount = wishlist.length;

  const addToCart = (product: Product) => {
    if (!user) return false;
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...current, { ...product, quantity: 1 }];
    });
    return true;
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
    if (!user) return false;
    setWishlist((current) => {
      if (current.some((item) => item.id === product.id)) return current;
      return [...current, product];
    });
    return true;
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((current) => current.filter((item) => item.id !== productId));
  };

  const isWishlisted = (productId: string) => wishlist.some((item) => item.id === productId);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data?.message || 'Unable to sign in' };
      }
      const signedInUser = { id: data.id, email: data.email, name: data.name || '' };
      setUser(signedInUser);
      loadUserStorage(signedInUser);
      return { success: true, message: 'Signed in successfully' };
    } catch {
      return { success: false, message: 'Unable to sign in at the moment' };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data?.message || 'Unable to create account' };
      }
      const signedUpUser = { id: data.id, email: data.email, name: data.name || name };
      setUser(signedUpUser);
      loadUserStorage(signedUpUser);
      return { success: true, message: 'Account created successfully' };
    } catch {
      return { success: false, message: 'Unable to register at the moment' };
    }
  };

  const signOut = () => {
    if (typeof window !== 'undefined') {
      if (user) {
        window.localStorage.removeItem(getCartKey(user.id));
        window.localStorage.removeItem(getWishlistKey(user.id));
      }
      window.localStorage.removeItem(USER_KEY);
      window.localStorage.removeItem(CART_KEY);
      window.localStorage.removeItem(WISHLIST_KEY);
    }
    setUser(null);
    setCart([]);
    setWishlist([]);
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        user,
        isAuthenticated: Boolean(user),
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
        signIn,
        signUp,
        signOut,
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
