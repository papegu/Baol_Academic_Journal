"use client";
import { useEffect, useMemo, useState } from 'react';

interface Article { id: number; title: string; authors: string; status: string; pdfUrl: string; }

export default function EditorDashboardPage() {
  const [submitted, setSubmitted] = useState<Article[]>([]);
  const [accepted, setAccepted] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  const fetchList = async () => {
    setLoading(true);
    const sRes = await fetch('/api/articles?status=SUBMITTED');
    const aRes = await fetch('/api/articles?status=ACCEPTED');
    const sData = await sRes.json();
    const aData = await aRes.json();
    setSubmitted(sData.articles || []);
    setAccepted(aData.articles || []);
    setLoading(false);
  };

  useEffect(() => { fetchList(); }, []);

  const stats = useMemo(() => ({
    submitted: submitted.length,
    accepted: accepted.length,
    toPublish: accepted.filter(a => a.status === 'ACCEPTED').length,
  }), [submitted, accepted]);

  const updateStatus = async (id: number, status: string) => {
    setError('');
    try {
      const res = await fetch('/api/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Erreur lors de la mise à jour');
        return;
      }
      await fetchList();
    } catch {
      setError('Erreur réseau');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-brand-gray-800">Espace Éditeur</h2>
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="text-xs uppercase tracking-wide text-brand-gray-500">Soumis</div>
          <div className="text-2xl font-bold text-brand-gray-800">{stats.submitted}</div>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="text-xs uppercase tracking-wide text-brand-gray-500">Acceptés</div>
          <div className="text-2xl font-bold text-brand-gray-800">{stats.accepted}</div>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="text-xs uppercase tracking-wide text-brand-gray-500">À publier</div>
          <div className="text-2xl font-bold text-brand-gray-800">{stats.toPublish}</div>
        </div>
      </div>

      {loading ? (
        <div className="text-brand-gray-500">Chargement…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <h3 className="text-lg font-semibold text-brand-gray-800 mb-2">Soumis</h3>
            <ul className="space-y-3">
              {submitted.map(a => (
                <li key={a.id} className="border p-4 rounded bg-white shadow-sm">
                  <div className="font-semibold text-brand-gray-800">{a.title}</div>
                  <div className="text-sm text-brand-gray-600">{a.authors}</div>
                  <div className="mt-2">
                    <textarea
                      placeholder="Note de révision (interne)"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={notes[a.id] || ''}
                      onChange={e => setNotes(prev => ({ ...prev, [a.id]: e.target.value }))}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={async () => {
                          const body = { note: notes[a.id] || '' };
                          await fetch(`/api/reviews/${a.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                        }}
                        className="px-3 py-1 rounded bg-brand-blue-600 text-white hover:bg-brand-blue-700"
                      >
                        Enregistrer la note
                      </button>
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/reviews/${a.id}`);
                          const data = await res.json();
                          setNotes(prev => ({ ...prev, [a.id]: data?.note?.note || '' }));
                        }}
                        className="px-3 py-1 rounded bg-brand-gray-200 text-brand-gray-800 hover:bg-brand-gray-300"
                      >
                        Charger la note
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => updateStatus(a.id, 'ACCEPTED')} className="bg-brand-green-600 text-white px-3 py-1 rounded hover:bg-brand-green-700">Accepter</button>
                    <button onClick={() => updateStatus(a.id, 'REJECTED')} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Rejeter</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-brand-gray-800 mb-2">Acceptés</h3>
            <ul className="space-y-3">
              {accepted.map(a => (
                <li key={a.id} className="border p-4 rounded bg-white shadow-sm">
                  <div className="font-semibold text-brand-gray-800">{a.title}</div>
                  <div className="text-sm text-brand-gray-600">{a.authors}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => updateStatus(a.id, 'PUBLISHED')} className="bg-brand-blue-600 text-white px-3 py-1 rounded hover:bg-brand-blue-700">Publier</button>
                    <a href={a.pdfUrl} className="text-brand-blue-600 underline">PDF</a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
