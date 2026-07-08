"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../providers';
import { useAppContext } from '../providers';

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('best-selling');
  const [addMessage, setAddMessage] = useState('');
  const { addToCart, addToWishlist, isWishlisted, isAuthenticated } = useAppContext();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const selectedCollection = params.get('collection');
    const selectedView = params.get('view');
    if (selectedView === 'all') {
      setFilter('all');
    } else if (selectedCollection) {
      setFilter(selectedCollection);
    }
  }, []);

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      setAddMessage('Please sign in to add items to cart.');
      window.setTimeout(() => setAddMessage(''), 1800);
      router.push('/auth/signin');
      return;
    }
    addToCart(product);
    setAddMessage(`${product.name} added to cart`);
    window.setTimeout(() => setAddMessage(''), 1800);
  };

  const handleAddToWishlist = (product: Product) => {
    if (!isAuthenticated) {
      setAddMessage('Please sign in to save items to wishlist.');
      window.setTimeout(() => setAddMessage(''), 1800);
      router.push('/auth/signin');
      return;
    }
    addToWishlist(product);
    setAddMessage(`${product.name} added to wishlist`);
    window.setTimeout(() => setAddMessage(''), 1800);
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([fetch('/api/categories'), fetch('/api/products')]);
        const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : [];
        const productsData = productsResponse.ok ? await productsResponse.json() : [];
        setCollections(Array.isArray(categoriesData) ? categoriesData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch {
        setCollections([]);
        setProducts([]);
      }
    };

    loadProducts();
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

        {addMessage ? (
          <div className="mb-6 rounded-[2rem] border border-[#b68a2c]/30 bg-[#fdf0d7] p-5 text-sm font-medium text-[#7b591c] shadow-sm">
            {addMessage}
          </div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full rounded-[2rem] border border-stone-200 bg-[#fff7e8] p-10 text-center text-stone-600">
              No products found for this filter. Try selecting a different collection.
            </div>
          ) : null}

          {filteredProducts.map((product) => (
            <div key={product.id} className="rounded-[2rem] border border-stone-200 bg-[#fdf8f1] p-6 shadow-sm">
              <div className="mb-4 overflow-hidden rounded-[1.5rem] bg-[#f6efe8] h-60">
                <img src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80'} alt={product.name} className="h-full w-full object-cover" />
              </div>
              <h2 className="font-display text-xl text-stone-900">{product.name}</h2>
              <p className="mt-2 text-sm text-stone-600">₹{product.price}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={() => handleAddToCart(product)} className="rounded-full border border-[#b68a2c]/40 bg-white px-4 py-2 text-sm text-[#b68a2c]">Add to cart</button>
                <button onClick={() => handleAddToWishlist(product)} className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700">
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
