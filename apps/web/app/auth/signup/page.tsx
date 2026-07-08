'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../providers';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const { signUp, isAuthenticated } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('a2_user') : null;
    if (isAuthenticated || stored) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password || !name) {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      const response = await signUp(name, email, password);
      if (!response.success) {
        setMessage(response.message);
        return;
      }
      setMessage('Account created! Redirecting to sign in...');
      setTimeout(() => router.push('/auth/signin'), 800);
    } catch {
      setMessage('Unable to sign up at the moment.');
    }
  };

  return (
    <main className="min-h-screen bg-[#f6efe8] text-stone-800">
      <section className="mx-auto max-w-md px-6 py-20 lg:px-8">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-10 shadow-sm">
          <h1 className="font-display text-3xl font-semibold text-stone-900">Sign up</h1>
          <p className="mt-3 text-stone-600">Create your account and start shopping.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className="w-full rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" className="w-full rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" className="w-full rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
            <button type="submit" className="w-full rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-[#f8efe2] transition hover:bg-[#b68a2c]">Create account</button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-600">
            Already have an account? <Link href="/auth/signin" className="font-semibold text-[#b68a2c]">Sign in</Link>
          </p>
          {message ? <p className="mt-4 text-center text-sm text-[#b68a2c]">{message}</p> : null}
        </div>
      </section>
    </main>
  );
}
