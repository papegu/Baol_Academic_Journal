"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-green-700 text-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-white border rounded p-1">
            <Image src="/logo.png" alt="Baol Academic Journal" width={48} height={48} priority />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold text-white">Baol Academic Journal</div>
            <div className="text-xs text-green-100">Applied Research in Agriculture, Health & Living Environment</div>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <Link className="text-brand.gray-700 hover:text-brand.blue-700 font-medium" href="/">Accueil</Link>
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="text-white hover:text-green-200 font-medium px-2 py-1 rounded border border-white"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              Services
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow z-50">
                <div className="flex flex-col py-2">
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/about">About</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/policies">Policies</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/services">Services</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/subscription">Subscription</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/fast-track">Fast Track</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/language-support">Language Support</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/conference-services">Conference Services</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/publication-services">Publication Services</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/journals">Journals</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/conferences">CONFERENCES</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/books">Books</Link>
                </div>
              </div>
            )}
          </div>
          <Link className="text-white hover:text-green-200 font-medium" href="/journals">Journals</Link>
          <Link className="text-white hover:text-green-200 font-medium" href="/conferences">CONFERENCES</Link>
          <Link className="text-white hover:text-green-200 font-medium" href="/books">Books</Link>
          <Link className="text-white hover:text-green-200 font-medium" href="/submit">Submission</Link>
          <form action="/search" method="GET" className="flex items-center gap-2">
            <label htmlFor="q" className="sr-only">Search for</label>
            <input id="q" name="q" type="text" placeholder="Search for" className="border px-2 py-1 rounded bg-white text-black" />
            <button className="bg-white text-green-800 px-3 py-1 rounded border border-green-800">Search</button>
          </form>
        </div>
      </div>
    </header>
  );
}
