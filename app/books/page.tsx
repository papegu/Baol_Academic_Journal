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

  async function initiatePayment(amountXof: number, bookId: number) {
    setError('');
    try {
      const rate = Number(process.env.NEXT_PUBLIC_XOF_PER_USD || '600');
      const amount = Math.round(((amountXof / (rate > 0 ? rate : 600)) * 100)) / 100;
      const res = await fetch('/api/paytech/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'USD', description: 'Lecture livre BAJP', bookId })
      });
      const data = await res.json();
      setPendingRef(data.ref || '');
      // Navigate to the provider's checkout in the same tab to avoid popup blockers
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        const lastAttempt = data.debug?.attempts?.[data.debug.attempts.length - 1];
        const providerText = typeof lastAttempt?.body === 'string' ? lastAttempt.body.trim() : '';
        setError((data.reason || providerText || 'Erreur de paiement') + (providerText ? ` — Provider: ${providerText}` : ''));
        if (data.debug) {
          console.error('PayTech initiation debug', data.debug);
        }
      }
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
                    <span className="text-xs text-brand-gray-500">Vous serez redirigé vers le paiement sécurisé.</span>
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
