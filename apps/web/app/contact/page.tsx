export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f6efe8] text-stone-800">
      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <h1 className="font-display text-4xl font-semibold text-stone-900">Questions or comments?</h1>
        <p className="mt-4 text-stone-600">Get in touch and we’ll be happy to help.</p>
        <form className="mt-10 space-y-4 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <input type="text" placeholder="Name" className="w-full rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
          <input type="email" placeholder="Email" className="w-full rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
          <input type="tel" placeholder="Phone number" className="w-full rounded-full border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
          <textarea placeholder="Comment" rows={6} className="w-full rounded-[1.25rem] border border-stone-200 bg-[#f9f6f1] px-4 py-3 text-sm text-stone-800 outline-none" />
          <button type="submit" className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-[#f8efe2] transition hover:bg-[#b68a2c]">Send</button>
        </form>
      </section>
    </main>
  );
}
