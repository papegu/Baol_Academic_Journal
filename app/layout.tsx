import './tailwind.css';
import './globals.css';
import './layout.css';
import type { Metadata } from 'next';
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TopBar from '../components/TopBar';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Baol Academic Journal Platform',
  description: 'Journal of Applied Research in Agriculture, Health and Living Environment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Read preferred language from cookie, default to French for continuity
  const lang = cookies().get('lang')?.value || 'fr';
  const supported = new Set(['fr', 'en', 'es', 'it']);
  const htmlLang = supported.has(lang) ? lang : 'fr';
  return (
    <html lang={htmlLang}>
      <body className="bg-brand-gray-50 min-h-screen">
        <TopBar />
        <Header />
        <main className="max-w-6xl mx-auto py-8 px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
