'use client'

import type { Metadata } from "next";
import { Inter, Roboto_Mono } from 'next/font/google';
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { SessionProvider } from "next-auth/react";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <SessionProvider refetchInterval={0}>
          <Navbar/>
          {children}
        </SessionProvider>

      </body>
    </html>
  );
}