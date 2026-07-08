'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppContext } from '../../app/providers';

export default function WishlistPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const { wishlist, removeFromWishlist, addToCart, isAuthenticated } = useAppContext();

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f6efe8] text-stone-800">
        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
            <h1 className="font-display text-4xl font-semibold text-stone-900">Wishlist</h1>
            <p className="mt-4 text-stone-600">Please sign in to view and save your wishlist.</p>
            <button onClick={() => router.push('/auth/signin')} className="mt-8 rounded-full bg-[#b68a2c] px-6 py-3 text-white transition hover:bg-[#967034]">Sign in</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6efe8] text-stone-800">
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="mb-10 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="font-display text-4xl font-semibold text-stone-900">Wishlist</h1>
          <p className="mt-3 text-stone-600">Your saved favourites are here.</p>
        </div>
        {wishlist.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-[#fff7e8] p-12 text-center text-stone-600">
            Your wishlist is empty. <Link href="/shop" className="text-[#b68a2c]">Browse products</Link>.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {wishlist.map((item) => (
              <div key={item.id} className="rounded-[2rem] border border-stone-200 bg-[#fdf8f1] p-6 shadow-sm">
                <h2 className="font-display text-xl text-stone-900">{item.name}</h2>
                <p className="mt-2 text-sm text-stone-600">₹{item.price}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => addToCart(item)} className="rounded-full border border-[#b68a2c]/40 bg-white px-4 py-2 text-sm text-[#b68a2c]">Add to cart</button>
                  <button onClick={() => removeFromWishlist(item.id)} className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
