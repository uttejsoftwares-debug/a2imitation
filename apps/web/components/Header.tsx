'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Search, ShoppingBag, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAppContext } from '../app/providers';

const shopMenu = [
  { label: 'Handmade Collection', href: '/shop?collection=handmade' },
  { label: 'Instagram Collection', href: '/shop?collection=instagram' },
  { label: 'Best Sellers', href: '/shop?collection=best-sellers' },
  { label: 'New Collection', href: '/shop?collection=new-collection' },
  { label: 'All Collections', href: '/shop' },
  { label: 'All Products', href: '/shop?view=all' },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, wishlistCount } = useAppContext();

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
        </nav>

        <div className="flex items-center gap-3 text-stone-600">
          <Link href="/search" className="rounded-full border border-stone-200 bg-white p-2 transition hover:border-[#b68a2c] hover:text-[#b68a2c]" aria-label="Search">
            <Search size={18} />
          </Link>
          <Link href="/auth/signin" className="rounded-full border border-stone-200 bg-white p-2 transition hover:border-[#b68a2c] hover:text-[#b68a2c]" aria-label="Sign In">
            <User size={18} />
          </Link>
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
    </header>
  );
}

