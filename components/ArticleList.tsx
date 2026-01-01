interface Article {
  id: number;
  title: string;
  authors: string;
  status: string;
  pdfUrl: string; // stores R2 key (e.g., articles/YYYY/slug-uuid.pdf)
}

export default function ArticleList({ articles }: { articles: Article[] }) {
  if (!articles || articles.length === 0) {
    return <div className="text-brand-gray-500">Aucun article.</div>;
  }
  return (
    <ul className="space-y-3">
      {articles.map((article) => (
        <li key={article.id} className="border p-4 rounded bg-white shadow-sm">
          <div className="font-semibold text-brand-gray-800">{article.title}</div>
          <div className="text-sm text-brand-gray-600">{article.authors}</div>
          <div className="text-xs text-brand-gray-500">Statut : {article.status}</div>
          <a href={`/api/articles/pdf/${article.pdfUrl}`} className="text-brand-blue-600 underline">Lire le PDF</a>
        </li>
      ))}
    </ul>
  );
}
