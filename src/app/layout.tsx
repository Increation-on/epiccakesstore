import { Inter, Playfair_Display } from 'next/font/google';
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import CartSyncWrapper from "@/components/providers/CartSyncWrapper";

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        {/* Preload правильного формата WebP */}
        <link 
          rel="preload" 
          as="image" 
          href="/images/cake-background_2.webp" 
          fetchPriority="high"
          type="image/webp"
        />
        {/* Preconnect для Google Fonts */}
        <link 
          rel="preconnect" 
          href="https://fonts.googleapis.com" 
          crossOrigin="anonymous"
        />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous"
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