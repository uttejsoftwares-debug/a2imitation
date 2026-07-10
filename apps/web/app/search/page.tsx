'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, useAppContext } from '../../app/providers';
import { buildApiUrl } from '../../lib/api';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { addToCart, addToWishlist, isWishlisted, isAuthenticated } = useAppContext();

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError('');

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(buildApiUrl('/api/products'));
        if (!response.ok) throw new Error('Unable to load products');
        const data = await response.json();
        const filtered = data.filter((product: Product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) || product.description?.toLowerCase().includes(query.toLowerCase()),
        );
        setProducts(filtered);
      } catch (err) {
        setError('Unable to search products.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const results = useMemo(() => products, [products]);

  return (
    <main className="min-h-screen bg-[#f6efe8] text-stone-800">
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="font-display text-4xl font-semibold text-stone-900">Search</h1>
          <p className="mt-3 text-stone-600">Find the perfect jewellery by name or collection.</p>
          <div className="mt-8">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." className="w-full rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
          </div>
        </div>

        {loading ? <p className="text-stone-600">Searching...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((product) => (
            <div key={product.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mb-3 h-52 overflow-hidden rounded-[1.5rem] bg-[#f6efe8]">
                <img src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80'} alt={product.name} className="h-full w-full object-cover" />
              </div>
              <h2 className="font-display text-xl text-stone-900">{product.name}</h2>
              <p className="mt-2 text-sm text-stone-600">₹{product.price}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      setMessage('Please sign in to add items to your cart.');
                      router.push('/auth/signin');
                      return;
                    }
                    addToCart(product);
                    setMessage(`${product.name} added to cart.`);
                  }}
                  className="rounded-full border border-[#b68a2c]/40 bg-white px-4 py-2 text-sm text-[#b68a2c]"
                >
                  Add to cart
                </button>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      setMessage('Please sign in to save items to wishlist.');
                      router.push('/auth/signin');
                      return;
                    }
                    addToWishlist(product);
                    setMessage(`${product.name} added to wishlist.`);
                  }}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
                >
                  {isWishlisted(product.id) ? 'Wishlisted' : 'Add to wishlist'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
