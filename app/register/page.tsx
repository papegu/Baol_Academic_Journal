"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (res.ok) {
        router.push('/login');
      } else {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          setError(data.message || 'Erreur lors de l\'inscription');
        } else {
          const text = await res.text();
          // Common production case: Vercel Password Protection
          if (/Vercel Authentication/i.test(text)) {
            setError('Accès protégé: utilisez le Protection Bypass Token ou désactivez temporairement la protection pour tester.');
          } else {
            setError('Erreur lors de l\'inscription (réponse non-json)');
          }
        }
      }
    } catch (err) {
      setError((err as any)?.message || 'Erreur réseau');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Inscription</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-gray-800">Email</label>
          <input id="email" type="email" autoComplete="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-brand-gray-800">Nom complet</label>
          <input id="name" type="text" autoComplete="name" placeholder="Nom complet" value={name} onChange={e => setName(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-brand-gray-800">Mot de passe</label>
          <input id="password" type="password" autoComplete="new-password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" disabled={loading} className={`w-full text-white py-2 rounded ${loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}>{loading ? 'Inscription...' : "S'inscrire"}</button>
        <div className="text-sm mt-2">
          Déjà un compte ? <a href="/login" className="text-brand-blue-600 underline">Se connecter</a>
        </div>
      </form>
    </div>
  );
}
