"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const [isAuthed, setIsAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const roleCookie = document.cookie
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('role='));
    setIsAuthed(!!roleCookie);
  }, []);

  const handleLogout = () => {
    document.cookie = 'role=; Max-Age=0; path=/';
    document.cookie = 'access_token=; Max-Age=0; path=/';
    try { localStorage.removeItem('role'); localStorage.removeItem('access_token'); } catch {}
    router.replace('/login');
  };

  return (
    <div className="bg-brand-gray-200 text-brand-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="text-sm">
          <a href="/" className="hover:underline mr-3">Accueil</a>
          <a href="/articles" className="hover:underline mr-3">Articles</a>
          <a href="http://senegal-livres.sn" target="_blank" rel="noopener" className="hover:underline">Senegal-livres.sn</a>
        </div>
        {isAuthed ? (
          <button className="text-sm px-3 py-1 rounded bg-brand-gray-300 hover:bg-brand-gray-400" onClick={handleLogout}>
            Déconnexion
          </button>
        ) : (
          <div className="text-sm">
            <a href="/login" className="hover:underline mr-2">Connexion</a>
            <a href="/register" className="hover:underline">Inscription</a>
          </div>
        )}
      </div>
    </div>
  );
}