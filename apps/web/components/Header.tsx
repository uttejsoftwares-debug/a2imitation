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
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-[0.3em] text-[#b68a2c]">
            <Image src="/a2logo.png" alt="A2 Imitation Jewellery logo" width={32} height={32} className="h-8 w-8 object-contain" priority />
            A2 Imitation Jewellery
          </Link>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm text-stone-600 md:flex">
          <Link href="/" className={pathname === '/' ? 'font-semibold text-stone-900' : 'hover:text-[#b68a2c]'}>Home</Link>
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="inline-flex items-center gap-1 hover:text-[#b68a2c]">
              Shop <ChevronDown size={14} />
            </button>
            {menuOpen ? (
              <div className="absolute left-0 top-full mt-2 w-56 rounded-3xl border border-stone-200 bg-white p-3 shadow-xl">
                {shopMenu.map((item) => (
                  <Link key={item.href} href={item.href} className="block rounded-2xl px-4 py-3 text-sm text-stone-700 transition hover:bg-[#f6efe8]" onClick={() => setMenuOpen(false)}>
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
        {/* mobile hamburger */}
        <div className="flex md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen((s) => !s)}
            className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white p-2 text-stone-700 hover:border-[#b68a2c] hover:text-[#b68a2c]"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="flex items-center gap-3 text-stone-600">
          <Link href="/search" className="rounded-full border border-stone-200 bg-white p-2 transition hover:border-[#b68a2c] hover:text-[#b68a2c]" aria-label="Search">
            <Search size={18} />
          </Link>
          {mounted && (isAuthenticated || storedUser) ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-[#b68a2c] hover:text-[#b68a2c] md:inline-flex">
                <User size={18} />
                <span>{user?.name || storedUser?.name ? `Hi, ${user?.name || storedUser?.name}` : 'My Account'}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  setStoredUser(null);
                }}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-[#b68a2c] hover:text-[#b68a2c] md:inline-flex"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  setStoredUser(null);
                }}
                className="inline-flex rounded-full border border-stone-200 bg-white p-2 text-stone-700 transition hover:border-[#b68a2c] hover:text-[#b68a2c] md:hidden"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            mounted && (
              <Link href="/auth/signin" className="rounded-full border border-stone-200 bg-white p-2 transition hover:border-[#b68a2c] hover:text-[#b68a2c]" aria-label="Sign In">
                <User size={18} />
              </Link>
            )
          )}
          <Link href="/wishlist" className="relative rounded-full border border-stone-200 bg-white p-2 transition hover:border-[#b68a2c] hover:text-[#b68a2c]" aria-label="Wishlist">
            <Heart size={18} />
            {wishlistCount > 0 ? <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b68a2c] px-1.5 text-[0.65rem] font-semibold text-white">{wishlistCount}</span> : null}
          </Link>
          <Link href="/cart" className="relative rounded-full border border-stone-200 bg-white p-2 transition hover:border-[#b68a2c] hover:text-[#b68a2c]" aria-label="Cart">
            <ShoppingBag size={18} />
            {cartCount > 0 ? <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b68a2c] px-1.5 text-[0.65rem] font-semibold text-white">{cartCount}</span> : null}
          </Link>
        </div>
      </div>
      {/* mobile menu panel */}
      {mobileOpen ? (
        <div className="md:hidden border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex flex-col gap-2">
              <Link href="/" className="block py-2 text-sm text-stone-700">Home</Link>
              <details>
                <summary className="cursor-pointer py-2 text-sm text-stone-700">Shop</summary>
                <div className="mt-2 flex flex-col gap-1">
                  {shopMenu.map((item) => (
                    <Link key={item.href} href={item.href} className="block pl-4 py-2 text-sm text-stone-600">{item.label}</Link>
                  ))}
                </div>
              </details>
              <Link href="/about" className="block py-2 text-sm text-stone-700">About</Link>
              <Link href="/contact" className="block py-2 text-sm text-stone-700">Contact</Link>
              <Link href="/track-order" className="block py-2 text-sm text-stone-700">Track Order</Link>
              {isAuthenticated ? <Link href="/orders" className="block py-2 text-sm text-stone-700">My Orders</Link> : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

