import './globals.css';

import { AppLayoutWrapper } from '@/components/layout';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Providers } from '@/lib/providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Flexee - Energy Platform',
  description: 'Plateforme de gestion des signaux EDF pour infrastructures de recharge',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`} suppressHydrationWarning>
        <Providers>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
