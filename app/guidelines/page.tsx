export default function GuidelinesPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-brand-gray-800">Guidelines</h2>
      <ol className="list-decimal pl-6 text-brand-gray-700 space-y-2">
        <li>Longueur recommandée: 6 à 12 pages, format PDF.</li>
        <li>Structure: Titre, Auteurs, Résumé, Mots-clés, Introduction, Méthodes, Résultats, Discussion, Conclusion, Références.</li>
        <li>Normes de citation: suivant standards académiques (APA/IEEE selon le domaine).</li>
        <li>Qualité: clarté, reproductibilité, éthique et intégrité scientifique.</li>
        <li>Soumission: via la page « Soumettre »; un identifiant de suivi vous sera attribué.</li>
      </ol>
      <p className="text-sm text-brand-gray-500">Publication bimestrielle. Des frais peuvent être requis pour les articles acceptés avant publication.</p>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-brand-gray-800">Templates</h3>
        <p className="text-brand-gray-700">Téléchargez les modèles du journal&nbsp;:</p>
        <ul className="list-disc pl-6 text-brand-gray-700 space-y-1">
          <li>
            <a className="text-brand-blue-600 underline" href="/template_word.doc" download>
              Template Word (.doc)
            </a>
          </li>
          <li>
            <a className="text-brand-blue-600 underline" href="/template_word.tex" download>
              Template LaTeX (.tex)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
