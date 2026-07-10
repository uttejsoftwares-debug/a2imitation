'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppContext } from '../../app/providers';

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CartPage() {
  const router = useRouter();
  const { cart, total, updateQuantity, removeFromCart, clearCart, isAuthenticated } = useAppContext();
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setCheckoutMessage('Please sign in before checking out.');
      router.push('/auth/signin');
      return;
    }
    if (cart.length === 0) {
      setCheckoutMessage('Add items to your cart before checkout.');
      return;
    }

    const itemLines = cart.map((item) => `${item.quantity}x ${item.name} (₹${item.price})`).join('%0A');
    const message = `Hello A2 Imitation, I would like to place an order:%0A${itemLines}%0A%0ATotal: ₹${total}`;

    try {
      const response = await fetch('/api/contact/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, name: 'Customer', email: 'guest@a2-imitation.com', phone: '' }),
      });
      const payload = await response.json();
      if (payload.link) {
        window.open(payload.link, '_blank', 'noopener,noreferrer');
        clearCart();
        setCheckoutMessage('Opening WhatsApp to complete your order.');
        return;
      }
    } catch {
      setCheckoutMessage('Unable to open WhatsApp right now. Please try again.');
    }
  };

  const handleOnlinePayment = async () => {
    if (!isAuthenticated) {
      setCheckoutMessage('Please sign in before payment.');
      router.push('/auth/signin');
      return;
    }
    if (cart.length === 0) {
      setCheckoutMessage('Add items to your cart before payment.');
      return;
    }

    setIsProcessing(true);
    setCheckoutMessage('Preparing payment...');

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `cart-${Date.now()}`,
          provider: 'razorpay',
          method: 'online',
          amount: total,
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity, price: item.price })),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setCheckoutMessage(payload?.message || 'Unable to start payment.');
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setCheckoutMessage('Unable to load Razorpay checkout. Please try again.');
        return;
      }

      const options = {
        key: payload.keyId,
        amount: payload.amount,
        currency: payload.currency,
        name: 'A2 Imitation',
        description: 'Order payment',
        order_id: payload.orderId,
        handler: (response: any) => {
          console.log('Razorpay payment success', response);
          setCheckoutMessage('Payment completed successfully. Thank you!');
          clearCart();
        },
        prefill: {
          name: 'Guest Customer',
          email: 'guest@a2-imitation.com',
          contact: '',
        },
        theme: {
          color: '#b68a2c',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setCheckoutMessage('Opening Razorpay checkout...');
    } catch (error) {
      console.error(error);
      setCheckoutMessage('Unable to start payment right now. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f6efe8] text-stone-800">
        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
            <h1 className="font-display text-4xl font-semibold text-stone-900">Your cart</h1>
            <p className="mt-4 text-stone-600">Please sign in to manage your cart and make payments.</p>
            <button onClick={() => router.push('/auth/signin')} className="mt-8 rounded-full bg-[#b68a2c] px-6 py-3 text-white transition hover:bg-[#967034]">Sign in</button>
          </div>
        </section>
      </main>
    );
  }

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
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button onClick={handleCheckout} className="rounded-full bg-[#4b4a48] px-6 py-3 text-sm font-semibold text-[#f8efe2] transition hover:bg-[#6f5f38]">Checkout via WhatsApp</button>
                <button
                  onClick={handleOnlinePayment}
                  disabled={isProcessing}
                  className="rounded-full bg-[#b68a2c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#967034] disabled:opacity-60"
                >
                  {isProcessing ? 'Processing...' : 'Pay online'}
                </button>
              </div>
              {checkoutMessage ? <p className="mt-4 text-sm text-[#b68a2c]">{checkoutMessage}</p> : null}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
