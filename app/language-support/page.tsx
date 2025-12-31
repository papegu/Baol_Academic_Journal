"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LanguageSupportPage(){
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);

  function setLang(lang: 'fr' | 'en' | 'es' | 'it'){
    setSaving(lang);
    // Critical: set a cookie for language preference; server layout reads it
    document.cookie = `lang=${lang}; path=/; max-age=${60*60*24*365}`; // 1 year
    // Refresh to apply new <html lang> and any server content depending on it
    router.refresh();
  }

  return (
    <section className="space-y-6">
      <div className="bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold text-brand-gray-800">Language Support</h1>
        <p className="text-brand-gray-700 mt-2">Choisissez votre langue d'affichage pour le site.</p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button onClick={() => setLang('fr')} disabled={saving==='fr'} className="px-4 py-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-60">Français</button>
          <button onClick={() => setLang('en')} disabled={saving==='en'} className="px-4 py-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-60">English</button>
          <button onClick={() => setLang('es')} disabled={saving==='es'} className="px-4 py-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-60">Español</button>
          <button onClick={() => setLang('it')} disabled={saving==='it'} className="px-4 py-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-60">Italiano</button>
        </div>
        {saving && <p className="text-sm text-brand-gray-600 mt-3">Préférence appliquée: {saving.toUpperCase()}. Actualisation…</p>}
      </div>
    </section>
  );
}
