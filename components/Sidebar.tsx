import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-full md:w-64 bg-white border-r">
      <div className="px-4 py-4">
        <div className="text-sm font-semibold text-brand-gray-700 mb-2">Tableau de bord</div>
        <nav className="space-y-2 text-sm">
          <Link className="block px-3 py-2 rounded hover:bg-brand-gray-100" href="/dashboard/author">Aperçu auteur</Link>
          <Link className="block px-3 py-2 rounded hover:bg-brand-gray-100" href="/admin">Administration</Link>
          <Link className="block px-3 py-2 rounded hover:bg-brand-gray-100" href="/articles">Articles</Link>
          <Link className="block px-3 py-2 rounded hover:bg-brand-gray-100" href="/submit">Soumettre</Link>
        </nav>
      </div>
    </aside>
  );
}
