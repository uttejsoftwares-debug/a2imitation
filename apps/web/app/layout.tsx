import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { AppProvider } from './providers';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Banner } from '../components/Banner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  title: 'A2 Imitation',
  description: 'Luxury imitation jewellery crafted for celebration.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cormorant.variable} font-sans bg-[#f6efe8] text-stone-800`}>
        <AppProvider>
          <Header />
          <Banner />
        {children}
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
