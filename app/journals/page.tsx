import DomainsSection from '../../components/DomainsSection';

export default function JournalsPage(){
  return (
    <section className="space-y-6">
      <div className="bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold text-brand.gray-800">Journals</h1>
        <p className="text-brand.gray-700 mt-2">Domaines scientifiques présentés sous forme de grille (style IIETA).</p>
      </div>
      <DomainsSection />
    </section>
  );
}
