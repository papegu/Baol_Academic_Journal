"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  // Build-time env flags (NEXT_PUBLIC_* are available client-side)
  const demoAuth = (process.env.NEXT_PUBLIC_DEMO_AUTH || 'false') === 'true';
  const prismaAuth = true; // We authenticate against Prisma `User` table

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined') {
          const role = data.role || 'AUTHOR';
          localStorage.setItem('role', role);
          localStorage.setItem('access_token', data.access_token || '');
        }
        const role = data.role || 'AUTHOR';
        if (role === 'ADMIN') {
          router.push('/admin');
        } else if (role === 'EDITOR') {
          router.push('/dashboard/editor');
        } else {
          router.push('/dashboard/author');
        }
      } else {
        const data = await res.json();
        setError(data.message || 'Erreur lors de la connexion');
      }
    } catch (err) {
      setError('Erreur réseau');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Connexion</h2>
      {/* Auth mode banner */}
      <div className="mb-4 rounded border px-3 py-2 text-sm">
        {demoAuth ? (
          <div className="text-brand-gray-700">
            Mode démo activé. Utilisez les identifiants configurés dans l'environnement
            (<span className="font-semibold">ADMIN_EMAIL/ADMIN_PASSWORD</span> ou
            <span className="font-semibold">AUTHOR_EMAIL/AUTHOR_PASSWORD</span>).
          </div>
        ) : prismaAuth ? (
          <div className="text-brand-gray-700">Authentification via la base de données (table <span className="font-semibold">User</span>).</div>
        ) : (
          <div className="text-brand-gray-700">Aucune configuration d'auth détectée. Configurez Supabase ou activez le mode démo.</div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-gray-800">Email</label>
          <input id="email" type="email" autoComplete="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-brand-gray-800">Mot de passe</label>
          <input id="password" type="password" autoComplete="current-password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Se connecter</button>
        <div className="text-sm mt-2">
          Pas de compte ? <a href="/register" className="text-brand-blue-600 underline">S'inscrire</a>
        </div>
      </form>
    </div>
  );
}
