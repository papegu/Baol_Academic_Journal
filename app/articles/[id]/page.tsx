"use client";
"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/articles/${id}`)
      .then(res => res.json())
      .then(data => {
        setArticle(data.article);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-gray-500">Chargement…</div>;
  if (!article) return <div className="text-gray-500">Article introuvable.</div>;

  return (
    <div className="bg-white p-8 rounded shadow max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">{article.title}</h2>
      <div className="text-gray-600 mb-2">{article.authors}</div>
      <div className="text-gray-500 mb-4">Statut : {article.status}</div>
      <div className="mb-4">{article.abstract}</div>
      <a href={article.pdfUrl} className="text-blue-600 underline" download>Télécharger le PDF</a>
    </div>
  );
}
