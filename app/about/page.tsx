export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <h2 className="text-2xl font-bold text-brand.gray-800">À propos</h2>
      <p className="text-brand.gray-700">
        Baol Academic Journal Platform est une plateforme académique dédiée à la publication bimestrielle d'articles scientifiques.
        Elle vise la rigueur scientifique, la transparence du processus éditorial et un design sobre et professionnel.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h3 className="text-lg font-semibold text-brand.gray-800">Services</h3>
          <ul className="list-disc pl-6 text-brand.gray-700 space-y-1">
            <li>Publication académique</li>
            <li>Évaluation par les pairs</li>
            <li>Support éditorial</li>
          </ul>
        </section>
        <section>
          <h3 className="text-lg font-semibold text-brand.gray-800">Subscription</h3>
          <p className="text-brand.gray-700">Informations d'abonnement institutionnel et individuel (à venir).</p>
        </section>
        <section>
          <h3 className="text-lg font-semibold text-brand.gray-800">Fast Track</h3>
          <p className="text-brand.gray-700">Voie accélérée pour certaines catégories d'articles (selon critères).</p>
        </section>
        <section>
          <h3 className="text-lg font-semibold text-brand.gray-800">Language Support</h3>
          <p className="text-brand.gray-700">Support FR/EN pour auteurs et éditeurs.</p>
        </section>
        <section>
          <h3 className="text-lg font-semibold text-brand.gray-800">Conference Services</h3>
          <p className="text-brand.gray-700">Partenariats et publications liées aux conférences.</p>
        </section>
        <section>
          <h3 className="text-lg font-semibold text-brand.gray-800">Publication Services</h3>
          <p className="text-brand.gray-700">Mise en page, DOI, indexation (à venir).</p>
        </section>
        <section>
          <h3 className="text-lg font-semibold text-brand.gray-800">Journals & Conferences</h3>
          <p className="text-brand.gray-700">Listes de journaux et conférences partenaires.</p>
        </section>
        <section>
          <h3 className="text-lg font-semibold text-brand.gray-800">Books</h3>
          <p className="text-brand.gray-700">Ouvrages et monographies (à venir).</p>
        </section>
      </div>

      <section>
        <h3 className="text-lg font-semibold text-brand.gray-800">Submission</h3>
        <p className="text-brand.gray-700">La soumission nécessite un compte. Les utilisateurs non connectés seront redirigés vers Connexion ou Inscription.</p>
        <div className="mt-2 flex gap-3">
          <a className="text-brand.blue-600 underline" href="/submit">Soumettre un article</a>
          <a className="text-brand.blue-600 underline" href="/login">Connexion</a>
          <a className="text-brand.blue-600 underline" href="/register">Inscription</a>
        </div>
      </section>
    </div>
  );
}
