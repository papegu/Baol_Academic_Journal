"use client";
import { useEffect, useState } from 'react';

export default function BooksPage(){
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingRef, setPendingRef] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/books');
        const data = await res.json();
        setBooks(data.books || []);
      } catch (e: any) {
        setError(e?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function initiatePayment(amount: number, bookId: number) {
    setError('');
    try {
      const res = await fetch('/api/paytech/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description: 'Lecture livre BAJP', bookId })
      });
      const data = await res.json();
      setPendingRef(data.ref || '');
      if (data.url) window.open(data.url, '_blank');
    } catch (e: any) {
      setError(e?.message || 'Erreur de paiement');
    }
  }

  return (
    <section className="space-y-6">
      <div className="bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold text-brand-gray-800">Books</h1>
        <p className="text-brand-gray-700 mt-2">Parcourez les ouvrages. Payer via Paytech pour lire.</p>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {loading ? (
        <div className="text-brand-gray-600">Chargement…</div>
      ) : books.length === 0 ? (
        <div className="text-brand-gray-600">Aucun livre pour le moment.</div>
      ) : (
        <ul className="space-y-4">
          {books.map((b) => (
            <li key={b.id} className="border p-4 rounded bg-white">
              <div className="font-semibold text-brand-gray-800">{b.title}</div>
              <div className="text-sm text-brand-gray-600">{b.authors}</div>
              <div className="text-sm text-brand-gray-600">{b.description}</div>
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                {b.pdfUrl ? (
                  <>
                    <button
                      className="text-sm px-3 py-1 rounded bg-brand-blue-600 text-white"
                      onClick={() => initiatePayment(1000, b.id)}
                    >Payer et lire</button>
                    <input
                      value={pendingRef}
                      onChange={(e) => setPendingRef(e.target.value)}
                      placeholder="Référence paiement"
                      className="text-sm border px-2 py-1 rounded"
                    />
                    <a
                      href={`/api/books/pdf?key=${encodeURIComponent(b.pdfUrl)}&ref=${encodeURIComponent(pendingRef)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm px-3 py-1 rounded bg-brand-gray-200"
                    >Lire (avec référence)</a>
                  </>
                ) : (
                  <span className="text-xs text-brand-gray-500">Pas de PDF disponible</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
