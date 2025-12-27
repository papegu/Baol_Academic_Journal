export type Article = {
  id: number;
  title: string;
  authors: string;
  abstract: string;
  pdfUrl: string;
  status: "SUBMITTED" | "ACCEPTED" | "PUBLISHED" | "REJECTED";
};

// Basic in-memory mock store for now
let seq = 3;
const articles: Article[] = [
  {
    id: 1,
    title: 'Effet des pratiques agricoles sur la santé des sols',
    authors: 'A. Ndiaye, M. Diop',
    abstract: "Résumé de l’article 1",
    pdfUrl: '/dummy1.pdf',
    status: 'PUBLISHED',
  },
  {
    id: 2,
    title: 'Impact des pesticides sur l’environnement',
    authors: 'F. Ba, S. Sow',
    abstract: "Résumé de l’article 2",
    pdfUrl: '/dummy2.pdf',
    status: 'SUBMITTED',
  },
];

export function listArticlesByStatus(status?: Article["status"]) {
  if (!status) return articles.filter(a => a.status === 'PUBLISHED');
  return articles.filter(a => a.status === status);
}

export function getArticleById(id: number) {
  return articles.find(a => a.id === id) || null;
}

export function updateArticleStatus(id: number, status: Article["status"]) {
  const idx = articles.findIndex(a => a.id === id);
  if (idx === -1) return null;
  articles[idx].status = status;
  return articles[idx];
}

export function submitArticle(input: Omit<Article, "id" | "status">) {
  const newItem: Article = {
    id: seq++,
    ...input,
    status: 'SUBMITTED',
  };
  articles.push(newItem);
  return newItem;
}
