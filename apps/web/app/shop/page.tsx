"use client";
import { useEffect, useMemo, useState } from 'react';
import { Product } from '../providers';
import { useAppContext } from '../providers';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [productsRawText, setProductsRawText] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('best-selling');
  const { addToCart, addToWishlist, isWishlisted } = useAppContext();

  useEffect(() => {
    const safeFetch = async (url: string) => {
      try {
        const text = await fetch(url).then((r) => r.text());
        try {
          const parsed = JSON.parse(text);
          // If parsed is a string (double-encoded), parse again
          if (typeof parsed === 'string') return JSON.parse(parsed);
          return parsed;
        } catch (err) {
          // fallback: return as-is
          return text;
        }
      } catch (err) {
        return null;
      }
    };

    safeFetch('/api/categories').then((data) => {
      if (!data) return setCollections([]);
      setCollections(Array.isArray(data) ? data : []);
      console.log('categories loaded', data);
    });

    safeFetch('/api/products').then((data) => {
      if (!data) return setProducts([]);
      setProducts(Array.isArray(data) ? data : []);
      console.log('products loaded', data);
    });

    // Also fetch raw text to inspect exact response body (direct backend)
    fetch('http://localhost:4000/api/products')
      .then((r) => r.text())
      .then((t) => setProductsRawText(t))
      .catch(() => setProductsRawText(''));
  }, []);

  const filteredProducts = useMemo(() => {
    let items = [...products];
    if (filter !== 'all') {
      items = items.filter((product) => product.category?.slug === filter);
    }
    if (sort === 'price-low') items.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') items.sort((a, b) => b.price - a.price);
    return items;
  }, [products, filter, sort]);

  return (
    <main className="min-h-screen bg-[#f6efe8] text-stone-800">
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 rounded-[2rem] border border-stone-200 bg-white p-10 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold text-stone-900">Shop</h1>
            <p className="mt-3 text-stone-600">Browse all collections and discover your next favourite piece.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3">
              <label className="text-sm text-stone-500">Availability</label>
            </div>
            <div className="rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3">
              <label className="text-sm text-stone-500">Price</label>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600">
            <span>Filter:</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-2 text-sm text-stone-700 outline-none">
              <option value="all">All Products</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.slug}>{collection.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600">
            <span>Sort by:</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-2 text-sm text-stone-700 outline-none">
              <option value="best-selling">Best selling</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
            </select>
            <span>{filteredProducts.length} products</span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {/* DEBUG: show raw products data */}
          <div className="col-span-full">
            <div className="mb-4 text-xs text-stone-600">
              <div className="font-medium">Raw response text:</div>
              <pre className="whitespace-pre-wrap">{productsRawText || '(empty)'}</pre>
            </div>
            <div className="text-xs text-stone-600">
              <div className="font-medium">Parsed products state:</div>
              <pre className="whitespace-pre-wrap">{JSON.stringify(products, null, 2)}</pre>
            </div>
          </div>

          {filteredProducts.map((product) => (
            <div key={product.id} className="rounded-[2rem] border border-stone-200 bg-[#fdf8f1] p-6 shadow-sm">
              <div className="mb-4 overflow-hidden rounded-[1.5rem] bg-[#f6efe8] h-60">
                <img src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80'} alt={product.name} className="h-full w-full object-cover" />
              </div>
              <h2 className="font-display text-xl text-stone-900">{product.name}</h2>
              <p className="mt-2 text-sm text-stone-600">₹{product.price}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={() => addToCart(product)} className="rounded-full border border-[#b68a2c]/40 bg-white px-4 py-2 text-sm text-[#b68a2c]">Add to cart</button>
                <button onClick={() => addToWishlist(product)} className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700">
                  {isWishlisted(product.id) ? 'Wishlisted' : 'Wishlist'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
