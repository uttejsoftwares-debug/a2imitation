'use client';

import { useAppContext } from '../../app/providers';

export default function CartPage() {
  const { cart, total, updateQuantity, removeFromCart, clearCart } = useAppContext();

  return (
    <main className="min-h-screen bg-[#f6efe8] text-stone-800">
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm lg:flex-row lg:justify-between lg:items-center">
          <div>
            <h1 className="font-display text-4xl font-semibold text-stone-900">Your cart</h1>
            <p className="mt-3 text-stone-600">Review items before checkout.</p>
          </div>
          <button onClick={clearCart} className="rounded-full border border-stone-200 bg-[#f9f6f1] px-5 py-3 text-sm text-stone-700 transition hover:border-[#b68a2c] hover:text-[#b68a2c]">Clear cart</button>
        </div>
        {cart.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-[#fff7e8] p-12 text-center text-stone-600">Your cart is empty.</div>
        ) : (
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="grid gap-4 rounded-[2rem] border border-stone-200 bg-[#fdf8f1] p-6 md:grid-cols-[1fr_120px_120px] md:items-center">
                <div>
                  <h2 className="font-display text-xl text-stone-900">{item.name}</h2>
                  <p className="mt-2 text-sm text-stone-600">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-700">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="rounded-full border border-stone-200 bg-white px-3 py-2">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded-full border border-stone-200 bg-white px-3 py-2">+</button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-stone-900">₹{item.quantity * item.price}</span>
                  <button onClick={() => removeFromCart(item.id)} className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-[#b68a2c] hover:text-[#b68a2c]">Remove</button>
                </div>
              </div>
            ))}
            <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-right">
              <p className="text-sm text-stone-600">Total</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900">₹{total}</p>
              <button className="mt-6 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-[#f8efe2] transition hover:bg-[#b68a2c]">Checkout via WhatsApp</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
