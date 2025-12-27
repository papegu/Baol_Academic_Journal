"use client";
"use client";
import { useEffect, useState } from 'react';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Articles publiés</h2>
      {loading ? (
        <div className="text-gray-500">Chargement…</div>
      ) : articles.length === 0 ? (
        <div className="text-gray-500">Aucun article publié pour le moment.</div>
      ) : (
        <ul className="space-y-4">
          {articles.map((article: any) => (
            <li key={article.id} className="border p-4 rounded bg-white shadow">
              <div className="font-semibold text-lg">{article.title}</div>
              <div className="text-sm text-gray-600">{article.authors}</div>
              <div className="text-xs text-gray-500">{article.status}</div>
              <a href={article.pdfUrl} className="text-blue-600 underline" download>Télécharger PDF</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
