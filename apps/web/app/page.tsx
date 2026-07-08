"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Gem, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from './providers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

type Category = { id: string; name: string; slug: string };
type Product = {
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

const featuredCollections = [
  { title: 'Royal Bridal', subtitle: 'Statement sets for timeless celebrations', image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80' },
  { title: 'Festive Glow', subtitle: 'Layered luxury for every occasion', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80' },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tick, setTick] = useState(0);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', phone: '' });
  const { cart, total, addToCart, clearCart, isAuthenticated } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((r) => {
        if (!r.ok) throw new Error(`categories failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        console.log('categories loaded', data);
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('categories error', error);
        setCategories([]);
      });

    fetch(`${API_BASE}/api/products`)
      .then((r) => {
        if (!r.ok) throw new Error(`products failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        console.log('products loaded', data);
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('products error', error);
        setProducts([]);
      });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const addToCartClick = (product: Product) => {
    if (!isAuthenticated) {
      setCheckoutMessage('Please sign in to add items to your cart.');
      router.push('/auth/signin');
      return;
    }
    addToCart(product);
    setCheckoutMessage(`${product.name} added to your cart.`);
  };

  const handleEnquire = async (product?: Product) => {
    const message = product
      ? `Hello A2 Jewellery, I am interested in ${product.name} (${product.sku || 'product'}). Please share more details and pricing.`
      : 'Hello A2 Jewellery, I would like to enquire about your latest jewellery collection.';

    try {
      const response = await fetch(`${API_BASE}/api/contact/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const payload = await response.json();
      if (payload.link) {
        window.open(payload.link, '_blank', 'noopener,noreferrer');
        setEnquiryMessage('Your enquiry was prepared for WhatsApp.');
      }
    } catch {
      setEnquiryMessage('We could not start WhatsApp right now. Please call us directly.');
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setCheckoutMessage('Please sign in to place an order.');
      router.push('/auth/signin');
      return;
    }
    if (!checkoutForm.name || !checkoutForm.email || cart.length === 0) {
      setCheckoutMessage('Please add a name, email, and at least one item to place an order.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: checkoutForm.email,
          name: checkoutForm.name,
          phone: checkoutForm.phone,
          address: 'Customer request',
          city: 'Online',
          state: 'India',
          postalCode: '000000',
          country: 'India',
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
          paymentMethod: 'whatsapp',
        }),
      });
      const payload = await response.json();
      if (payload.whatsappLink) {
        window.open(payload.whatsappLink, '_blank', 'noopener,noreferrer');
        setCheckoutMessage(`Order ready. We will contact you soon on ${checkoutForm.email}.`);
        clearCart();
      } else {
        setCheckoutMessage('Your order request was submitted.');
      }
    } catch {
      setCheckoutMessage('We could not place the order right now. Please try again.');
    }
  };

  const handleEnquirySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!enquiryForm.name || !enquiryForm.email || !enquiryForm.message) {
      setEnquiryMessage('Please tell us your name, email, and what you are looking for.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/contact/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enquiryForm.name,
          email: enquiryForm.email,
          subject: 'Website enquiry',
          message: `${enquiryForm.message}\nPhone: ${enquiryForm.phone || 'Not provided'}`,
        }),
      });
      if (response.ok) {
        setEnquiryMessage('Thanks! We will reach out shortly.');
        setEnquiryForm({ name: '', email: '', phone: '', message: '' });
      }
    } catch {
      setEnquiryMessage('We could not submit your enquiry right now.');
    }
  };

  return (
    <main className="min-h-screen bg-[#f6efe8] text-stone-800">
      {/* Hero and layout follow — header is provided by RootLayout */}

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-8 rounded-[2.5rem] border border-stone-200 bg-[linear-gradient(135deg,_#fffaf4_0%,_#f7ecdf_100%)] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.06)] lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div className="max-w-2xl self-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8b46a]/40 bg-[#f7e8bf] px-3 py-1 text-sm text-[#a16f12]">
              <Sparkles size={16} /> Curated luxury jewellery for every celebration
            </div>
            <h1 className="font-display text-5xl leading-tight text-stone-900 sm:text-6xl lg:text-7xl">
              Timeless elegance reimagined in radiant gold allure.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">
              Discover heirloom-inspired imitation jewellery crafted for weddings, festive evenings, and modern luxury dressing.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="#products" className="flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 font-medium text-[#f8efe2] transition hover:bg-[#b68a2c]">
                Explore Collection <ArrowRight size={18} />
              </Link>
              <button type="button" onClick={() => handleEnquire()} className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-700 transition hover:border-[#b68a2c] hover:text-[#b68a2c]">
                Enquire Now
              </button>
            </div>
          </div>

          <div className="space-y-4 rounded-[2rem] border border-stone-200 bg-white/80 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.05)]">
            <div className="overflow-hidden rounded-[1.5rem]">
              <Image src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80" alt="Jewellery showcase" width={900} height={1100} className="h-[360px] w-full object-cover" />
            </div>
            <div className="rounded-[1.25rem] border border-stone-200 bg-[#fdf8f1] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[#b68a2c]">Live Cart</p>
                  <p className="mt-2 font-display text-2xl text-stone-900">{cart.length} item{cart.length === 1 ? '' : 's'} selected</p>
                </div>
                <div className="rounded-full bg-[#f7e8bf] p-3 text-[#b68a2c]">
                  <ShoppingBag size={20} />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-stone-600">
                {cart.length === 0 ? (
                  <p>Your selected pieces will appear here instantly.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-3 py-2">
                      <span>{item.name}</span>
                      <span className="text-[#b68a2c]">{item.quantity} × ₹{item.price}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4 text-sm text-stone-600">
                <span>Est. total</span>
                <span className="text-lg font-semibold text-stone-900">₹{total}</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input value={checkoutForm.name} onChange={(event) => setCheckoutForm({ ...checkoutForm, name: event.target.value })} placeholder="Your name" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-800 outline-none" />
                <input value={checkoutForm.email} onChange={(event) => setCheckoutForm({ ...checkoutForm, email: event.target.value })} placeholder="Email" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-800 outline-none" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button type="button" onClick={handleCheckout} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-[#f8efe2]">Checkout via WhatsApp</button>
                <button type="button" onClick={() => handleEnquire()} className="rounded-full border border-[#d8b46a]/40 px-4 py-2 text-sm text-[#b68a2c]">Talk to us</button>
              </div>
              {checkoutMessage ? <p className="mt-3 text-sm text-[#b68a2c]">{checkoutMessage}</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-3 lg:px-8">
        {[
          { icon: ShieldCheck, title: 'Premium Craftsmanship', copy: 'Hand-finished designs with polished brilliance.' },
          { icon: Truck, title: 'Express Delivery', copy: 'Fast dispatch and secure packaging across India.' },
          { icon: Gem, title: 'Certified Quality', copy: 'Premium plating and lasting shine with every piece.' },
        ].map((item) => (
          <div key={item.title} className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-6 shadow-sm">
            <item.icon className="text-[#b68a2c]" size={24} />
            <h3 className="mt-4 font-display text-xl text-stone-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">{item.copy}</p>
          </div>
        ))}
      </section>

      <section id="collections" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#b68a2c]">Featured Collections</p>
            <h2 className="mt-2 font-display text-3xl text-stone-900">Curated styles for every moment</h2>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {featuredCollections.map((collection) => (
            <div key={collection.title} className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
              <Image src={collection.image} alt={collection.title} width={900} height={700} className="h-72 w-full object-cover" />
              <div className="p-6">
                <h3 className="font-display text-2xl text-stone-900">{collection.title}</h3>
                <p className="mt-2 text-stone-600">{collection.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#b68a2c]">Collections</p>
            <h2 className="mt-2 font-display text-3xl text-stone-900">Shop by category</h2>
          </div>
        </div>

        {categories.length === 0 ? (
          <p className="text-stone-600">No categories yet.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="mb-12">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-2xl text-stone-900">{cat.name}</h3>
                <Link href={`/category/${cat.slug}`} className="text-sm font-medium text-[#b68a2c]">View all</Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {products.filter((p) => p.category?.id === cat.id).map((product) => {
                  const imgs: string[] = (product.images || []).map((i: any) => i.url).filter(Boolean);
                  const display = imgs.length ? imgs[tick % imgs.length] : 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80';
                  return (
                    <div key={product.id} className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
                      <div className="mb-4 overflow-hidden rounded-[1.25rem] bg-[#f6efe8] text-center">
                        <img src={display} alt={product.name} className="h-48 w-full object-cover" />
                      </div>
                      <p className="text-sm uppercase tracking-[0.25em] text-[#b68a2c]">{product.isNew ? 'New' : product.isFeatured ? 'Featured' : ''}</p>
                      <h3 className="mt-2 font-display text-xl text-stone-900">{product.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{product.description || 'Crafted for celebrations with a luminous finish.'}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-semibold text-stone-900">₹{Math.round(product.price || 0)}</span>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => addToCartClick(product)} className="rounded-full border border-[#d8b46a]/40 px-3 py-2 text-sm text-[#b68a2c]">Add to cart</button>
                          <button type="button" onClick={() => handleEnquire(product)} className="rounded-full border border-stone-200 px-3 py-2 text-sm text-stone-600">Enquire</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      

      <section id="contact" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#b68a2c]">Need help?</p>
              <h2 className="mt-2 font-display text-3xl text-stone-900">Request a personal jewellery consultation</h2>
              <p className="mt-4 max-w-xl text-stone-600">
                Share your style preferences and we will suggest the perfect bridal, festive, or everyday pieces for your celebration.
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm text-stone-600">
                <CheckCircle2 className="text-[#b68a2c]" size={18} />
                <span>Fast replies over WhatsApp and email</span>
              </div>
            </div>
            <form onSubmit={handleEnquirySubmit} className="space-y-4 rounded-[1.5rem] border border-stone-200 bg-[#fdf8f1] p-5">
              <input value={enquiryForm.name} onChange={(event) => setEnquiryForm({ ...enquiryForm, name: event.target.value })} placeholder="Your name" className="w-full rounded-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none" />
              <input value={enquiryForm.email} onChange={(event) => setEnquiryForm({ ...enquiryForm, email: event.target.value })} placeholder="Email address" className="w-full rounded-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none" />
              <input value={enquiryForm.phone} onChange={(event) => setEnquiryForm({ ...enquiryForm, phone: event.target.value })} placeholder="Phone number" className="w-full rounded-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none" />
              <textarea value={enquiryForm.message} onChange={(event) => setEnquiryForm({ ...enquiryForm, message: event.target.value })} placeholder="Tell us what you are looking for" rows={4} className="w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none" />
              <div className="flex items-center justify-between gap-4">
                <button type="submit" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-[#f8efe2]">Send enquiry</button>
                <button type="button" onClick={() => handleEnquire()} className="rounded-full border border-[#d8b46a]/40 px-4 py-3 text-sm text-[#b68a2c]">Chat on WhatsApp</button>
              </div>
              {enquiryMessage ? <p className="text-sm text-[#b68a2c]">{enquiryMessage}</p> : null}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
