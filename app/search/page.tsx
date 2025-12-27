export default function SearchPage({ searchParams }: { searchParams: { q?: string } }){
  const q = (searchParams?.q || '').trim();
  return (
    <section className="space-y-6">
      <div className="bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold text-brand-gray-800">Search</h1>
        <p className="text-brand-gray-700 mt-2">Results for: <strong>{q || '—'}</strong></p>
        <p className="text-brand-gray-600 mt-2">(Résultats réels à venir — implémenter recherche des articles et pages.)</p>
      </div>
    </section>
  );
}
