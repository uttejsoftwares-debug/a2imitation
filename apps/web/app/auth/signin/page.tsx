'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../providers';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { signIn, isAuthenticated } = useAppContext();

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('a2_user') : null;
    if (isAuthenticated || stored) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    try {
      const response = await signIn(email, password);
      if (!response.success) {
        setMessage(response.message);
        return;
      }
      setMessage('Signed in successfully! Redirecting...');
      setTimeout(() => router.push('/'), 600);
    } catch {
      setMessage('Unable to sign in at the moment.');
    }
  };

  return (
    <main className="min-h-screen bg-[#f6efe8] text-stone-800">
      <section className="mx-auto max-w-md px-6 py-20 lg:px-8">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-10 shadow-sm">
          <h1 className="font-display text-3xl font-semibold text-stone-900">Sign in</h1>
          <p className="mt-3 text-stone-600">Access your account or continue with Google.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" className="w-full rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" className="w-full rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
            <button type="submit" className="w-full rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-[#f8efe2] transition hover:bg-[#b68a2c]">Sign in</button>
          </form>
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="h-px flex-1 bg-stone-200" />
            <span className="text-sm uppercase tracking-[0.3em] text-stone-400">or</span>
            <span className="h-px flex-1 bg-stone-200" />
          </div>
          <button type="button" onClick={() => (window.location.href = '/api/auth/google')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 transition hover:border-[#b68a2c] hover:text-[#b68a2c]">
            <Image src="/google-logo.svg" alt="Google icon" width={20} height={20} className="h-5 w-5" />
            Continue with Google
          </button>
          <p className="mt-6 text-center text-sm text-stone-600">
            Don’t have an account? <Link href="/auth/signup" className="font-semibold text-[#b68a2c]">Sign up</Link>
          </p>
          {message ? <p className="mt-4 text-center text-sm text-[#b68a2c]">{message}</p> : null}
        </div>
      </section>
    </main>
  );
}
