import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Baol Academic Journal Platform',
  description: 'Journal of Applied Research in Agriculture, Health and Living Environment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-brand.gray-50 min-h-screen">
        <Header />
        <main className="max-w-6xl mx-auto py-8 px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
