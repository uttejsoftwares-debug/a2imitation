'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Search, ShoppingBag, User, ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppContext } from '../app/providers';

const shopMenu = [
  { label: 'Necklaces', href: '/shop?collection=necklaces' },
  { label: 'Earrings', href: '/shop?collection=earrings' },
  { label: 'Bridal Sets', href: '/shop?collection=bridal-sets' },
  { label: 'Rings', href: '/shop?collection=rings' },
  { label: 'Bangles', href: '/shop?collection=bangles' },
  { label: 'All Products', href: '/shop?view=all' },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storedUser, setStoredUser] = useState<{ id: string; name?: string; email: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const { cartCount, wishlistCount, user, isAuthenticated, signOut } = useAppContext();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadUser = () => {
      try {
        const saved = window.localStorage.getItem('a2_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && 'id' in parsed) {
            setStoredUser(parsed);
            return;
          }
        }
      } catch {
        // ignore invalid storage
      }
      setStoredUser(null);
    };

    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setStoredUser(user);
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#fdf8f1]/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-base font-semibold tracking-[0.24em] text-[#b68a2c] sm:text-lg">
          <Image src="/a2logo.png" alt="A2 Imitation logo" width={32} height={32} className="h-8 w-8 object-contain" priority />
          <span className="inline">A2 Imitation</span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-4 text-sm text-stone-600 md:flex">
          <Link href="/" className={pathname === '/' ? 'font-semibold text-stone-900' : 'hover:text-[#b68a2c]'}>Home</Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm transition hover:text-[#b68a2c]"
              aria-expanded={menuOpen}
            >
              Shop <ChevronDown size={14} />
            </button>
            {menuOpen ? (
              <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-3xl border border-stone-200 bg-white p-3 shadow-xl">
                {shopMenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-2xl px-4 py-3 text-sm text-stone-700 transition hover:bg-[#f6efe8]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <Link href="/about" className={pathname === '/about' ? 'font-semibold text-stone-900' : 'hover:text-[#b68a2c]'}>About</Link>
          <Link href="/contact" className={pathname === '/contact' ? 'font-semibold text-stone-900' : 'hover:text-[#b68a2c]'}>Contact</Link>
          <Link href="/track-order" className={pathname === '/track-order' ? 'font-semibold text-stone-900' : 'hover:text-[#b68a2c]'}>Track Order</Link>
          {isAuthenticated ? <Link href="/orders" className={pathname === '/orders' ? 'font-semibold text-stone-900' : 'hover:text-[#b68a2c]'}>My Orders</Link> : null}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/search" className="rounded-full border border-stone-200 bg-white p-2 transition hover:border-[#b68a2c] hover:text-[#b68a2c]" aria-label="Search">
              <Search size={18} />
            </Link>
            <Link href="/wishlist" className="relative rounded-full border border-stone-200 bg-white p-2 transition hover:border-[#b68a2c] hover:text-[#b68a2c]" aria-label="Wishlist">
              <Heart size={18} />
              {wishlistCount > 0 ? <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b68a2c] px-1.5 text-[0.65rem] font-semibold text-white">{wishlistCount}</span> : null}
            </Link>
            <Link href="/cart" className="relative rounded-full border border-stone-200 bg-white p-2 transition hover:border-[#b68a2c] hover:text-[#b68a2c]" aria-label="Cart">
              <ShoppingBag size={18} />
              {cartCount > 0 ? <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b68a2c] px-1.5 text-[0.65rem] font-semibold text-white">{cartCount}</span> : null}
            </Link>
            {mounted && (isAuthenticated || storedUser) ? (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-[#b68a2c] hover:text-[#b68a2c]">
                  <User size={18} />
                  <span>{user?.name || storedUser?.name ? `Hi, ${user?.name || storedUser?.name}` : 'My Account'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setStoredUser(null);
                  }}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-[#b68a2c] hover:text-[#b68a2c]"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              mounted && (
                <Link href="/auth/signin" className="rounded-full border border-stone-200 bg-white p-2 transition hover:border-[#b68a2c] hover:text-[#b68a2c]" aria-label="Sign In">
                  <User size={18} />
                </Link>
              )
            )}
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((s) => !s)}
            className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white p-2 text-stone-700 transition hover:border-[#b68a2c] hover:text-[#b68a2c] md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="md:hidden border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="grid gap-3">
              <Link href="/" onClick={() => setMobileOpen(false)} className="block rounded-3xl px-4 py-3 text-sm text-stone-700 hover:bg-[#f6efe8]">Home</Link>
              <details className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
                <summary className="cursor-pointer rounded-3xl px-4 py-3 text-sm text-stone-700">Shop</summary>
                <div className="space-y-1 border-t border-stone-200 px-4 py-3">
                  {shopMenu.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block rounded-2xl px-3 py-2 text-sm text-stone-600 hover:bg-[#f6efe8]">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
              <Link href="/about" onClick={() => setMobileOpen(false)} className="block rounded-3xl px-4 py-3 text-sm text-stone-700 hover:bg-[#f6efe8]">About</Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="block rounded-3xl px-4 py-3 text-sm text-stone-700 hover:bg-[#f6efe8]">Contact</Link>
              <Link href="/track-order" onClick={() => setMobileOpen(false)} className="block rounded-3xl px-4 py-3 text-sm text-stone-700 hover:bg-[#f6efe8]">Track Order</Link>
              {isAuthenticated ? <Link href="/orders" onClick={() => setMobileOpen(false)} className="block rounded-3xl px-4 py-3 text-sm text-stone-700 hover:bg-[#f6efe8]">My Orders</Link> : null}
              {mounted && (isAuthenticated || storedUser) ? (
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setStoredUser(null);
                    setMobileOpen(false);
                  }}
                  className="w-full rounded-3xl border border-stone-200 bg-[#fdf8f1] px-4 py-3 text-left text-sm font-semibold text-[#b68a2c] hover:bg-[#f6efe8]"
                >
                  Sign out
                </button>
              ) : (
                <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="block rounded-3xl border border-stone-200 bg-[#fdf8f1] px-4 py-3 text-sm font-semibold text-[#b68a2c] hover:bg-[#f6efe8]">
                  Sign in
                </Link>
              )}

              <div className="grid gap-2 rounded-3xl border border-stone-200 bg-white p-3">
                <Link href="/search" onClick={() => setMobileOpen(false)} className="block rounded-3xl px-4 py-3 text-sm text-stone-700 hover:bg-[#f6efe8]">Search</Link>
                <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="block rounded-3xl px-4 py-3 text-sm text-stone-700 hover:bg-[#f6efe8]">
                  Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
                </Link>
                <Link href="/cart" onClick={() => setMobileOpen(false)} className="block rounded-3xl px-4 py-3 text-sm text-stone-700 hover:bg-[#f6efe8]">
                  Cart{cartCount > 0 ? ` (${cartCount})` : ''}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

