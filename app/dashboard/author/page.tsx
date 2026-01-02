"use client";
import { useEffect, useState } from 'react';
import StatCard from '../../../components/StatCard';
import ArticleList from '../../../components/ArticleList';
import PaymentButton from '../../../components/PaymentButton';

export default function AuthorDashboardPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payError, setPayError] = useState<string>('');

  useEffect(() => {
    // Prefer my articles endpoint if available, fallback to submitted
    fetch('/api/submissions')
      .then(async (res) => {
        if (res.ok) return res.json();
        const alt = await fetch('/api/articles?status=SUBMITTED');
        return alt.json();
      })
      .then((data) => {
        const list = data.submissions || data.articles || [];
        setArticles(list);
        setLoading(false);
      });
  }, []);

  const submitted = articles.length;
  const accepted = articles.filter((a: any) => a.status === 'ACCEPTED').length;
  const published = articles.filter((a: any) => a.status === 'PUBLISHED').length;

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
          amount={(() => {
            const xof = 5000;
            const rate = Number(process.env.NEXT_PUBLIC_XOF_PER_USD || '600');
            const usd = xof / (rate > 0 ? rate : 600);
            return Math.round(usd * 100) / 100;
          })()}
          onPay={async () => {
            try {
              const target = articles.find(a => a.status === 'ACCEPTED');
              const xof = 5000;
              const rate = Number(process.env.NEXT_PUBLIC_XOF_PER_USD || '600');
              const amountUSD = Math.round((xof / (rate > 0 ? rate : 600)) * 100) / 100;
              const res = await fetch('/api/paytech/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId: target?.id || null, amount: amountUSD, currency: 'USD', description: 'Frais de publication BAJP' }),
              });
              const data = await res.json();
              if (res.ok && data.url) {
                window.location.href = data.url;
              } else {
                const lastAttempt = data.debug?.attempts?.[data.debug.attempts.length - 1];
                const providerText = typeof lastAttempt?.body === 'string' ? lastAttempt.body.trim() : '';
                setPayError((data.reason || providerText || 'Erreur de paiement') + (providerText ? ` — Provider: ${providerText}` : ''));
                if (data.debug) {
                  console.error('PayTech initiation debug', data.debug);
                }
              }
            } catch (e) {
              setPayError((e as any)?.message || 'Erreur de paiement');
            }
          }}
          disabled={accepted === 0}
        />
        {payError && <div className="text-sm text-red-600 mt-2">{payError}</div>}
        <div className="text-xs text-brand-gray-500 mt-2">Le paiement est requis pour les articles acceptés avant publication.</div>
      </div>
    </div>
  );
}
