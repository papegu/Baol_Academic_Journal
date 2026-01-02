"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en' | 'es' | 'it'>('fr');
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )lang=([^;]+)/);
    if (m) {
      const v = decodeURIComponent(m[1]) as any;
      if (['fr','en','es','it'].includes(v)) setLang(v);
    }
    const r = document.cookie.match(/(?:^|; )role=([^;]+)/);
    if (r) setRole(decodeURIComponent(r[1]));
  }, []);

  function applyLang(next: 'fr' | 'en' | 'es' | 'it'){
    // Critical: update cookie and refresh to apply immediately
    document.cookie = `lang=${next}; path=/; max-age=${60*60*24*365}`;
    setLang(next);
    router.refresh();
    setOpen(false);
  }

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
          <Link className="text-brand-gray-700 hover:text-brand-blue-700 font-medium" href="/">Accueil</Link>
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="text-white hover:text-green-200 font-medium px-2 py-1 rounded border border-white"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              Services
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-white/20 border border-white/30 align-middle">{lang.toUpperCase()}</span>
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow z-50">
                <div className="flex flex-col py-2">
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/about">About</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/policies">Policies</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/services">Services</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/subscription">Subscription</Link>
                  <Link className="px-3 py-1 hover:bg-gray-50 text-black" href="/fast-track">Fast Track</Link>
                  <div className="px-3 pt-1 pb-2 text-black">
                    <div className="text-xs text-gray-500 mb-1">Language</div>
                    <div className="grid grid-cols-4 gap-2">
                      <button onClick={() => applyLang('fr')} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">FR</button>
                      <button onClick={() => applyLang('en')} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">EN</button>
                      <button onClick={() => applyLang('es')} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">ES</button>
                      <button onClick={() => applyLang('it')} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">IT</button>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <Link className="underline" href="/language-support">Language Support</Link>
                    </div>
                  </div>
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
          {role === 'ADMIN' || role === 'EDITOR' ? (
            <Link className="bg-white text-green-800 px-3 py-1 rounded border border-green-800 hover:bg-green-50 font-medium" href="/admin">Admin</Link>
          ) : null}
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
