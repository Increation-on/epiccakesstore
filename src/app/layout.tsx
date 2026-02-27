import type { Metadata } from "next";
import { Inter, Roboto_Mono } from 'next/font/google';
import Link from "next/link";
import "./globals.css";

// Подключаем шрифты
const inter = Inter({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-inter',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "EpicCakesStore",
  description: "Магазин тортов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="font-sans">
        <header className="bg-white shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex gap-6">
            <Link href="/" className="font-bold text-xl">EpicCakes</Link>
            <Link href="/products" className="hover:text-blue-500">Товары</Link>
            <Link href="/about" className="hover:text-blue-500">О нас</Link>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-100 mt-8">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
            © 2026 EpicCakesStore
          </div>
        </footer>
      </body>
    </html>
  );
}