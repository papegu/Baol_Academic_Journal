"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Mock : vérifie le rôle dans localStorage (à remplacer par une vraie auth plus tard)
  useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    if (role !== 'ADMIN' && role !== 'EDITOR') {
      router.replace('/login');
    }
  }, [router]);

  const fetchArticles = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/articles?status=SUBMITTED').then(r => r.json()),
      fetch('/api/articles?status=ACCEPTED').then(r => r.json()),
      fetch('/api/articles?status=PUBLISHED').then(r => r.json()),
    ]).then(([s, a, p]) => {
      const merged = [...(s.articles || []), ...(a.articles || []), ...(p.articles || [])];
      setArticles(merged);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    setError('');
    try {
      const res = await fetch('/api/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchArticles();
      } else {
        const data = await res.json();
        setError(data.message || 'Erreur');
      }
    } catch {
      setError('Erreur réseau');
    }
  };

  const submitted = articles.filter(a => a.status === 'SUBMITTED').length;
  const accepted = articles.filter(a => a.status === 'ACCEPTED').length;
  const published = articles.filter(a => a.status === 'PUBLISHED').length;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-brand-gray-800">Espace Administration</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="text-xs uppercase tracking-wide text-brand-gray-500">Soumis</div>
          <div className="text-2xl font-bold text-brand-gray-800">{submitted}</div>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="text-xs uppercase tracking-wide text-brand-gray-500">Acceptés</div>
          <div className="text-2xl font-bold text-brand-gray-800">{accepted}</div>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="text-xs uppercase tracking-wide text-brand-gray-500">Publiés</div>
          <div className="text-2xl font-bold text-brand-gray-800">{published}</div>
        </div>
      </div>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-500">Chargement…</div>
      ) : articles.length === 0 ? (
        <div className="text-gray-500">Aucun article à valider.</div>
      ) : (
        <ul className="space-y-4">
          {articles.map((article: any) => (
            <li key={article.id} className="border p-4 rounded bg-white shadow-sm">
              <div className="font-semibold text-brand-gray-800">{article.title}</div>
              <div className="text-sm text-brand-gray-600">{article.authors}</div>
              <div className="text-xs text-brand-gray-500">Statut : {article.status}</div>
              {article.status === 'SUBMITTED' && (
                <>
                  <button onClick={() => updateStatus(article.id, 'ACCEPTED')} className="bg-brand-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-brand-green-700">Accepter</button>
                  <button onClick={() => updateStatus(article.id, 'REJECTED')} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Rejeter</button>
                </>
              )}
              {article.status === 'ACCEPTED' && (
                <button onClick={() => updateStatus(article.id, 'PUBLISHED')} className="bg-brand-blue-600 text-white px-3 py-1 rounded hover:bg-brand-blue-700">Publier</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
