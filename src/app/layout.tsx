import { Inter, Playfair_Display } from 'next/font/google';
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import CartSyncWrapper from "@/components/providers/CartSyncWrapper";
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


export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'EpicCakesStore',
  description: 'Лучшие торты на заказ',
  icons: {
    icon: '/favicon.ico?v=3',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <head>
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
        <SessionProviderWrapper session={session}>
          <Header />
          {children}
          <CartSyncWrapper />
          <Footer />
        </SessionProviderWrapper>
        <ToasterProvider />
      </body>
    </html>
  );
}