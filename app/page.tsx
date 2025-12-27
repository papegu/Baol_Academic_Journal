"use client";
import Link from 'next/link';
import DomainsSection from '@/components/DomainsSection';
import HomeDomains from '@/components/HomeDomains';
import { useState } from 'react';

export default function Home() {
  const [expanded, setExpanded] = useState(false);
  const introFull = `Baol Academic Journal Platform (BAJP) est une revue scientifique destinée en priorité aux enseignants-chercheurs africains, puis aux doctorants et étudiants d’Afrique de l’Ouest. Elle offre un cadre rigoureux de soumission, d’évaluation par les pairs et de publication en ligne, avec des frais de publication adaptés au contexte africain.

La revue met en avant les recherches en intelligence artificielle et modélisation appliquées à l’agriculture intelligente, à l’agroécologie augmentée, à la prévention et à l’amélioration de la santé, ainsi qu’aux mathématiques, à la chimie et à la physique appliquées. Elle vise à promouvoir des solutions scientifiques innovantes, fondées sur les outils numériques, au service du développement durable et de l’amélioration du cadre de vie en Afrique de l’Ouest.`;
  const introShort = `Baol Academic Journal Platform (BAJP) est une revue scientifique destinée en priorité aux enseignants-chercheurs africains, puis aux doctorants et étudiants d’Afrique de l’Ouest.`;

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-brand.gray-800">Bienvenue sur la plateforme Baol Academic Journal</h2>
        <p className="text-brand.gray-700 whitespace-pre-line">
          {expanded ? introFull : introShort}
        </p>
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-brand.blue-600 underline"
          >
            Lire plus
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Link
          href="/submit"
          className="bg-green-700 text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-green-800 border border-green-900 transition"
        >
          Soumettre un article
        </Link>
        <Link
          href="/articles"
          className="bg-green-700 text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-green-800 border border-green-900 transition"
        >
          Voir les articles publiés
        </Link>
        <Link
          href="/aim-scope"
          className="bg-green-700 text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-green-800 border border-green-900 transition"
        >
          Aim &amp; Scope
        </Link>
        <Link
          href="/login"
          className="bg-green-700 text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-green-800 border border-green-900 transition"
        >
          Connexion
        </Link>
      </div>

      <HomeDomains />
    </section>
  );
}
