import Image from 'next/image';
import Link from 'next/link';
import { buildApiUrl } from '../../../lib/api';
import type { Product } from '../../providers';

type Props = { params: { slug: string } };

export default async function ProductPage({ params: { slug } }: Props) {
  const url = buildApiUrl(`/api/products/${encodeURIComponent(slug)}`);
  const res = await fetch(url);
  const product: Product | null = res.ok ? await res.json() : null;

  if (!product) {
    return (
      <main className="min-h-screen bg-[#f6efe8] text-stone-800">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <p className="mt-4 text-stone-600">We could not find the product you are looking for.</p>
          <div className="mt-6">
            <Link href="/shop" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-[#f8efe2]">Back to shop</Link>
          </div>
        </div>
      </main>
    );
  }

  const images = (product.images || []).map((i) => i.url).filter(Boolean);
  const mainImage = images.length ? images[0] : '/banner1.jpg';

  return (
    <main className="min-h-screen bg-[#f6efe8] text-stone-800">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="order-1">
            <div className="overflow-hidden rounded-[1.5rem] bg-white p-4">
              <Image src={mainImage} alt={product.name} width={900} height={900} className="w-full object-cover rounded-lg" />
            </div>
            {images.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {images.map((src, idx) => (
                  <div key={idx} className="overflow-hidden rounded-lg">
                    {/* small thumbnails (non-functional) */}
                    <Image src={src} alt={`${product.name} ${idx + 1}`} width={200} height={200} className="h-20 w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="order-2 self-start">
            <h1 className="font-display text-2xl text-stone-900">{product.name}</h1>
            <p className="mt-2 text-sm text-stone-600">{product.category?.name}</p>
            <p className="mt-4 text-2xl font-semibold text-stone-900">₹{Math.round(product.price || 0)}</p>
            <p className="mt-4 text-stone-700">{product.description || 'Beautifully crafted imitation jewellery.'}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-[#f8efe2]">Add to cart</button>
              <button className="rounded-full border border-stone-200 px-4 py-3 text-sm text-stone-700">Enquire</button>
            </div>

            <div className="mt-6 text-sm text-stone-600">
              <p>SKU: {product.sku || '—'}</p>
              <p className="mt-1">Stock: {typeof product.stock === 'number' ? product.stock : '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
