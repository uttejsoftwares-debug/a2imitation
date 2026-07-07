import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6efe8] px-6 py-16 text-stone-800">
      <div className="max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#b68a2c]">Page not found</p>
        <h1 className="mt-3 font-display text-3xl text-stone-900">The page you are looking for does not exist.</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">Please return to the homepage to continue exploring the collection.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-[#f8efe2] transition hover:bg-[#b68a2c]">
          Back to home
        </Link>
      </div>
    </main>
  );
}
