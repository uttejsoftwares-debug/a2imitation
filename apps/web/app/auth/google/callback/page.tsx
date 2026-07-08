'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Signing you in with Google...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) {
      setStatus('Missing Google authorization code. Please try signing in again.');
      return;
    }

    const exchange = async () => {
      try {
        const response = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || `Google login failed with status ${response.status}`);
        }

        const user = await response.json();
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('a2_user', JSON.stringify(user));
          window.location.href = '/';
        } else {
          router.replace('/');
        }
      } catch (error) {
        console.error('Google callback error', error);
        setStatus(error instanceof Error ? error.message : 'Unable to complete Google sign-in.');
      }
    };

    exchange();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#f6efe8] text-stone-800">
      <section className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-12 text-center shadow-sm">
          <h1 className="font-display text-3xl font-semibold text-stone-900">Google sign in</h1>
          <p className="mt-4 text-stone-600">{status}</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => router.replace('/auth/signin')} className="rounded-full bg-[#b68a2c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#967034]">Return to sign in</button>
            <button onClick={() => router.push('/')} className="rounded-full border border-stone-200 bg-white px-6 py-3 text-sm text-stone-700 transition hover:border-[#b68a2c] hover:text-[#b68a2c]">Back to home</button>
          </div>
        </div>
      </section>
    </main>
  );
}
