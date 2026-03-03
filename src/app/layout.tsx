'use client'

import type { Metadata } from "next";
import { Inter, Roboto_Mono } from 'next/font/google';
import Link from "next/link";
import "./globals.css";
import { AuthStatus } from "@/components/AuthStatus";
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
          <AuthStatus />
          {children}
        </SessionProvider>

      </body>
    </html>
  );
}