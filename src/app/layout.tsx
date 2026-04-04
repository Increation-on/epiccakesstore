//src/app/layut.tsx

import { Inter, Playfair_Display } from 'next/font/google';
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import { CartSyncWrapper } from '@/components/providers/CartSyncWrapper';
import { ToasterProvider } from '@/components/ui/ToasterProvider';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link 
          rel="preload" 
          as="image" 
          href="/images/cake-background_2.webp" 
          fetchPriority="high"
          type="image/webp"
        />
      </head>
      <body>
        <SessionProviderWrapper session={session}>
           <CartSyncWrapper />
            <Header />
            {children}
            <Footer />
        </SessionProviderWrapper>
        <ToasterProvider />
      </body>
    </html>
  );
}