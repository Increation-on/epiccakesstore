'use client'

import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { SessionProvider } from "next-auth/react";
import { useCartSync } from '@/hooks/useCartSync';

function CartSync() {
  useCartSync()
  return null
}


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
          <CartSync />
        </SessionProvider>

      </body>
    </html>
  );
}