import { notFound } from 'next/navigation';

type Section = { heading: string; text: string };
type DomainData = {
  title: string;
  lead: string;
  sections: Section[];
};

const DOMAIN_CONTENT: Record<string, DomainData> = {
  'agriculture-intelligente-ia': {
    title: 'Modélisation IA en agriculture intelligente',
    lead: "Recherches sur l'IA et la modélisation appliquées à l'agriculture intelligente, la télédétection et l'agroécologie augmentée.",
    sections: [
      { heading: 'À propos', text: "Ce domaine accueille des travaux sur l'usage de l'IA et des données pour optimiser les systèmes agricoles." },
      { heading: 'Aims & Scope', text: "Agroécologie augmentée, télédétection, indicateurs agro-climatiques, optimisation des ressources et résilience climatique." }
    ]
  },
  'sante-ia': {
    title: 'Modélisation IA en santé',
    lead: "IA et modélisation pour la prévention et l'amélioration des systèmes de santé.",
    sections: [
      { heading: 'À propos', text: "Études quantitatives, modèles prédictifs et outils de décision en santé publique." },
      { heading: 'Aims & Scope', text: "Modèles épidémiologiques, IA clinique, optimisation des parcours de soins, santé numérique." }
    ]
  },
  'cadre-de-vie-ia': {
    title: 'IA pour l’amélioration du cadre de vie',
    lead: "Solutions IA pour l'environnement, l'urbanisme et la qualité de vie.",
    sections: [
      { heading: 'À propos', text: "Projets data-driven pour l'environnement, la mobilité et la gestion urbaine." },
      { heading: 'Aims & Scope', text: "Modélisation environnementale, capteurs, villes intelligentes et durabilité." }
    ]
  },
  'mathematiques-appliquees': {
    title: 'Mathématiques appliquées (agro-environnement & santé)',
    lead: "Modélisation mathématique et statistique appliquée aux systèmes agro-environnementaux et de santé.",
    sections: [
      { heading: 'À propos', text: "Méthodes mathématiques pour l'analyse, la simulation et l'optimisation." },
      { heading: 'Aims & Scope', text: "Équations différentielles, optimisation, probabilités, inférence et calcul scientifique." }
    ]
  },
  'chimie-appliquee': {
    title: 'Chimie appliquée',
    lead: "Chimie appliquée aux matériaux, à l'agriculture et à la santé.",
    sections: [
      { heading: 'À propos', text: "Études expérimentales et modélisation en chimie appliquée." },
      { heading: 'Aims & Scope', text: "Analytique, matériaux, procédés et impacts environnementaux." }
    ]
  },
  'physique-appliquee': {
    title: 'Physique appliquée',
    lead: "Physique appliquée aux systèmes agricoles, environnementaux et de santé.",
    sections: [
      { heading: 'À propos', text: "Instrumentation, télédétection, propriétés physiques des milieux et modélisation." },
      { heading: 'Aims & Scope', text: "Capteurs, optique, mécaniques des milieux, traitement du signal et imagerie." }
    ]
  }
};

export default function DomainPage({ params }: { params: { slug: string } }) {
  const domain = DOMAIN_CONTENT[params.slug];
  if (!domain) return notFound();

  return (
    <section className="space-y-6">
      <div className="bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold text-brand-gray-800">{domain.title}</h1>
        <p className="text-brand-gray-700 mt-2">{domain.lead}</p>
      </div>

      {domain.sections.map((s) => (
        <div key={s.heading} className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold text-brand-gray-800">{s.heading}</h2>
          <p className="text-brand-gray-700 mt-2">{s.text}</p>
        </div>
      ))}

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold text-brand-gray-800">Editorial Board</h2>
        <p className="text-brand-gray-700 mt-2">Exemple — mettre à jour avec les noms et affiliations réelles pour ce domaine.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          <div className="bg-white border rounded p-3">
            <div className="font-semibold">Dr. Exemple 1</div>
            <div className="text-brand-gray-600 text-sm">Editor — Institution</div>
          </div>
          <div className="bg-white border rounded p-3">
            <div className="font-semibold">Dr. Exemple 2</div>
            <div className="text-brand-gray-600 text-sm">Associate Editor — Institution</div>
          </div>
          <div className="bg-white border rounded p-3">
            <div className="font-semibold">Dr. Exemple 3</div>
            <div className="text-brand-gray-600 text-sm">Board Member — Institution</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold text-brand-gray-800">Current Issue</h2>
        <div className="space-y-3 mt-3">
          <article className="border rounded p-3">
            <div className="font-semibold">Titre d'article — exemple</div>
            <div className="text-brand-gray-600 text-sm">Auteurs — DOI: à venir</div>
            <p className="text-brand-gray-600 text-sm mt-1">Résumé court…</p>
          </article>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold text-brand-gray-800">Archives</h2>
        <ul className="list-disc pl-6 text-brand-gray-700 mt-2">
          <li>Vol 1, Issue 1 (2025) — inaugural issue</li>
        </ul>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold text-brand-gray-800">Submissions</h2>
        <p className="text-brand-gray-700">Préparez le manuscrit avec les templates et soumettez via la plateforme.</p>
        <div className="mt-2 flex gap-3">
          <a className="text-brand-blue-600 underline" href="/template_word.doc" download>Template Word (.doc)</a>
          <a className="text-brand-blue-600 underline" href="/template_word.tex" download>Template LaTeX (.tex)</a>
          <a className="text-brand-blue-600 underline" href="/submit">Soumettre</a>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold text-brand-gray-800">Contact</h2>
        <p className="text-brand-gray-700">Rédaction — BAJP</p>
        <p className="text-brand-gray-700">Email: editorial@bajp.org</p>
      </div>
    </section>
  );
}
