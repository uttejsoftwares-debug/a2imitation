'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || process.env.API_INTERNAL_URL || 'http://localhost:4000';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('a2-admin-token', data.token);
      router.replace('/');
    } catch (error) {
      setMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #111827 100%)', color: '#f8fafc', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <h1 style={{ margin: 0, fontSize: 32, color: '#fbbf24' }}>Admin Login</h1>
        <p style={{ margin: '12px 0 0', color: '#94a3b8' }}>Enter your admin credentials to access the dashboard.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14, marginTop: 24 }}>
          <label style={{ display: 'grid', gap: 6, color: '#cbd5e1' }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#f8fafc' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6, color: '#cbd5e1' }}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#f8fafc' }}
            />
          </label>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: 'none', background: '#fbbf24', color: '#111827', fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          {message ? <p style={{ margin: 0, color: '#fca5a5' }}>{message}</p> : null}
        </form>
      </div>
    </main>
  );
}
