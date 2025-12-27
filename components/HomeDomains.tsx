import Link from 'next/link';

type DomainInfo = {
  title: string;
  slug: string;
  issn?: string;
  indexing?: string;
  subject?: string;
};

const DOMAINS: DomainInfo[] = [
  {
    title: 'Modélisation IA en agriculture intelligente',
    slug: 'agriculture-intelligente-ia',
    issn: 'ISSN: à venir',
    indexing: 'Indexing: MIAR, Google Scholar, CrossRef, Portico, CNKI Scholar, Baidu Scholar',
    subject: "IA, télédétection, agroécologie augmentée et indicateurs agro-climatiques",
  },
  {
    title: 'Modélisation IA en santé',
    slug: 'sante-ia',
    issn: 'ISSN: à venir',
    indexing: 'Indexing: MIAR, Google Scholar, CrossRef, Portico, CNKI Scholar, Baidu Scholar',
    subject: "Modèles épidémiologiques, IA clinique, santé publique et parcours de soins",
  },
  {
    title: 'IA pour l’amélioration du cadre de vie',
    slug: 'cadre-de-vie-ia',
    issn: 'ISSN: à venir',
    indexing: 'Indexing: MIAR, Google Scholar, CrossRef, Portico, CNKI Scholar, Baidu Scholar',
    subject: "Environnement, urbanisme, capteurs et villes intelligentes",
  },
  {
    title: 'Mathématiques appliquées (agro-environnement & santé)',
    slug: 'mathematiques-appliquees',
    issn: 'ISSN: à venir',
    indexing: 'Indexing: MIAR, Google Scholar, CrossRef, Portico, CNKI Scholar, Baidu Scholar',
    subject: "Modélisation, optimisation, probabilités et calcul scientifique",
  },
  {
    title: 'Chimie appliquée',
    slug: 'chimie-appliquee',
    issn: 'ISSN: à venir',
    indexing: 'Indexing: MIAR, Google Scholar, CrossRef, Portico, CNKI Scholar, Baidu Scholar',
    subject: "Analytique, matériaux, procédés et impacts environnementaux",
  },
  {
    title: 'Physique appliquée',
    slug: 'physique-appliquee',
    issn: 'ISSN: à venir',
    indexing: 'Indexing: MIAR, Google Scholar, CrossRef, Portico, CNKI Scholar, Baidu Scholar',
    subject: "Instrumentation, télédétection, imagerie et traitement du signal",
  },
];

export default function HomeDomains() {
  return (
    <section className="space-y-6">
      {DOMAINS.map((d) => (
        <div key={d.slug} className="mx-auto w-[70%] h-[250px] border rounded-lg bg-white shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-brand.gray-800">{d.title}</h3>
            <p className="text-brand.gray-700 mt-2">{d.issn}</p>
            <p className="text-brand.gray-700">{d.indexing}</p>
            <p className="text-brand.gray-700 mt-2">Sujet: {d.subject}</p>
          </div>
          <div className="flex justify-end">
            <Link href={`/domains/${d.slug}`} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700">View Journal</Link>
          </div>
        </div>
      ))}
    </section>
  );
}
