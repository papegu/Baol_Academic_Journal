import Link from 'next/link';

const DOMAINS = [
  { title: 'Modélisation IA en agriculture intelligente', slug: 'agriculture-intelligente-ia', color: 'bg-brand-green-600' },
  { title: 'Modélisation IA en santé', slug: 'sante-ia', color: 'bg-brand-blue-600' },
  { title: 'IA pour l’amélioration du cadre de vie', slug: 'cadre-de-vie-ia', color: 'bg-brand-green-500' },
  { title: 'Mathématiques appliquées (agro-environnement & santé)', slug: 'mathematiques-appliquees', color: 'bg-brand-blue-500' },
  { title: 'Chimie appliquée', slug: 'chimie-appliquee', color: 'bg-brand-green-700' },
  { title: 'Physique appliquée', slug: 'physique-appliquee', color: 'bg-brand-blue-700' },
];

export default function DomainsSection() {
  return (
    <section className="mt-10">
      <h3 className="text-xl font-bold text-brand-gray-800 mb-4">Domaines scientifiques</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {DOMAINS.map((d) => (
          <Link key={d.title} href={`/domains/${d.slug}`} className="rounded-lg overflow-hidden border bg-white shadow-sm hover:shadow transition">
            <div className={`${d.color} h-2`}></div>
            <div className="p-4 text-brand-gray-800 text-sm font-medium">{d.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
