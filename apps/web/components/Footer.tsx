import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-[#fdf8f1] py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-stone-600 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>© 2026 A2 Imitation Jewellery. All rights reserved.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/contact" className="hover:text-[#b68a2c]">Contact</Link>
          <Link href="/track-order" className="hover:text-[#b68a2c]">Track Order</Link>
          <Link href="/auth/signin" className="hover:text-[#b68a2c]">Sign In</Link>
        </div>
      </div>
    </footer>
  );
}
