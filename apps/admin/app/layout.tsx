import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'A2 Admin',
  description: 'Administrative dashboard for A2 Imitation Jewellery',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
