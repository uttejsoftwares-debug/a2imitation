"use client";

import { useState } from 'react';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const handleTrack = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!orderId) {
      setMessage('Please enter your order ID or email/phone.');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      if (!response.ok) {
        setStatus(null);
        setMessage('Order not found. Please check the ID and try again.');
        return;
      }
      const order = await response.json();
      setStatus(order.status || 'pending');
      setMessage(`Order #${order.orderNumber} is currently ${order.status}.`);
    } catch {
      setStatus(null);
      setMessage('Unable to check order status. Please try again later.');
    }
  };

  return (
    <main className="min-h-screen bg-[#f6efe8] text-stone-800">
      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <h1 className="font-display text-4xl font-semibold text-stone-900">Track Order</h1>
        <p className="mt-4 text-stone-600">Enter your order ID to see the latest delivery status.</p>
        <form onSubmit={handleTrack} className="mt-10 space-y-4 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="Order ID or email/phone" className="w-full rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
          <button type="submit" className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-[#f8efe2] transition hover:bg-[#b68a2c]">Find Orders</button>
          {message ? <p className="text-sm text-stone-600">{message}</p> : null}
          {status ? <p className="rounded-2xl bg-[#fff4d9] px-4 py-3 text-sm font-semibold text-[#b68a2c]">Status: {status}</p> : null}
        </form>
      </section>
    </main>
  );
}
