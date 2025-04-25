import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { HeroUIProviders } from './HeroUIProviders';
import { ToastProvider } from '@heroui/toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lama Dev School Management Dashboard',
  description: 'Next.js School Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <HeroUIProviders>
          <ToastProvider
            placement={'bottom-center'}
            toastProps={{
              color: 'primary',
              variant: 'flat',
            }}
          />
          {children}
        </HeroUIProviders>
      </body>
    </html>
  );
}
