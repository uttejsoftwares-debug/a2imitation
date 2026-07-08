'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email || !message) {
      setStatus('Please enter your name, email, and message.');
      return;
    }

    try {
      const response = await fetch('/api/contact/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject: 'Website contact request', message: `${message}\nPhone: ${phone || 'Not provided'}` }),
      });
      if (!response.ok) {
        const payload = await response.json();
        setStatus(payload?.message || 'Unable to send message.');
        return;
      }
      setStatus('Message sent successfully. We will reply shortly.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch {
      setStatus('Unable to send message right now. Please try again later.');
    }
  };

  return (
    <main className="min-h-screen bg-[#f6efe8] text-stone-800">
      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <h1 className="font-display text-4xl font-semibold text-stone-900">Questions or comments?</h1>
        <p className="mt-4 text-stone-600">Get in touch and we’ll be happy to help.</p>
        <form onSubmit={handleSubmit} className="mt-10 space-y-4 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <input value={name} onChange={(event) => setName(event.target.value)} type="text" placeholder="Name" className="w-full rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" className="w-full rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" placeholder="Phone number" className="w-full rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Comment" rows={6} className="w-full rounded-[1.25rem] border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
          <button type="submit" className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-[#f8efe2] transition hover:bg-[#b68a2c]">Send</button>
          {status ? <p className="text-sm text-[#b68a2c]">{status}</p> : null}
        </form>
      </section>
    </main>
  );
}
