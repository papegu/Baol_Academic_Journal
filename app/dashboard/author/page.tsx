"use client";
import { useEffect, useState } from 'react';
import StatCard from '../../../components/StatCard';
import ArticleList from '../../../components/ArticleList';
import PaymentButton from '../../../components/PaymentButton';

export default function AuthorDashboardPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles?status=SUBMITTED')
      .then(res => res.json())
      .then(data => { setArticles(data.articles || []); setLoading(false); });
  }, []);

  const submitted = articles.length;
  const accepted = articles.filter((a) => a.status === 'ACCEPTED').length;
  const published = articles.filter((a) => a.status === 'PUBLISHED').length;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-brand-gray-800">Aperçu du compte</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Soumis" value={submitted} />
        <StatCard label="Acceptés" value={accepted} />
        <StatCard label="Publiés" value={published} />
      </div>

      <h3 className="text-lg font-semibold text-brand-gray-800">Mes articles</h3>
      {loading ? (
        <div className="text-brand-gray-500">Chargement…</div>
      ) : (
        <ArticleList articles={articles} />
      )}

      <div className="mt-4">
        <PaymentButton
          amount={5000}
          onPay={async () => {
            try {
              const target = articles.find(a => a.status === 'ACCEPTED');
              const res = await fetch('/api/paytech/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId: target?.id || null }),
              });
              const data = await res.json();
              if (data.url) window.open(data.url, '_blank');
            } catch (e) {
              console.error('Erreur de paiement', e);
            }
          }}
          disabled={accepted === 0}
        />
        <div className="text-xs text-brand-gray-500 mt-2">Le paiement est requis pour les articles acceptés avant publication.</div>
      </div>
    </div>
  );
}
