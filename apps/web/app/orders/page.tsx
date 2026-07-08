'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../providers';

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: { name: string };
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://a2imitation-api.onrender.com';

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setLoading(false);
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE}/api/orders?email=${encodeURIComponent(user.email)}`);
        if (!response.ok) {
          throw new Error('Unable to load orders');
        }
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Unable to load your orders right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f6efe8] text-stone-800">
        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
            <h1 className="font-display text-4xl font-semibold text-stone-900">My Orders</h1>
            <p className="mt-4 text-stone-600">You need to sign in to view your order history.</p>
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
          <h1 className="font-display text-4xl font-semibold text-stone-900">My Orders</h1>
          <p className="mt-3 text-stone-600">Here are the orders placed with your account.</p>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-stone-200 bg-[#fff7e8] p-12 text-center text-stone-600">Loading your orders…</div>
        ) : error ? (
          <div className="rounded-[2rem] border border-red-200 bg-[#fff1f0] p-12 text-center text-red-700">{error}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-[#fff7e8] p-12 text-center text-stone-600">
            You have no orders yet. <button onClick={() => router.push('/shop')} className="font-semibold text-[#b68a2c]">Browse products</button>.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-stone-500">Order #{order.orderNumber}</p>
                    <h2 className="font-display text-2xl text-stone-900">{order.status}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-stone-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="mt-2 text-2xl font-semibold text-stone-900">₹{order.total}</p>
                  </div>
                </div>
                <div className="mt-6 rounded-[1.5rem] border border-stone-200 bg-[#f9f6f1] p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-600">Items</h3>
                  <ul className="mt-4 space-y-3 text-sm text-stone-700">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-4">
                        <span>{item.product?.name || item.productId} x {item.quantity}</span>
                        <span className="font-semibold">₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
