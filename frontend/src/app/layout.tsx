import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Shri Radha Rani Shringar | श्री राधा रानी श्रृंगार - Vrindavan Devotional Store',
  description:
    'Authentic Radha Rani poshak, Laddu Gopal dresses, kundan mukut, brass bansuri, framed portraits and mandir decoration directly from Holy Vrindavan Dham.',
  keywords: [
    'Radha Rani Poshak',
    'Laddu Gopal Dress',
    'Vrindavan Devotional Store',
    'Thakurji Shringar',
    'Kundan Mukut',
    'Brass Bansuri',
    'Barsana',
    'Pooja Thali',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-radha-500 selection:text-white">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
