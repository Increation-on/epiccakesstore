import { Inter, Playfair_Display } from 'next/font/google';
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import CartSyncWrapper from "@/components/providers/CartSyncWrapper";

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  weight: ['400', '600', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon"  href="/favicon.ico?v=3" type="image/x-icon" />
        {/* Preload правильного формата WebP */}
        <link 
          rel="preload" 
          as="image" 
          href="/images/cake-background_2.webp" 
          fetchPriority="high"
          type="image/webp"
        />
      </head>
      <body>
        <SessionProviderWrapper>
          <Header />
          {children}
          <CartSyncWrapper />
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}