import DomainsSection from '../../components/DomainsSection';

export default function DomainsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand.gray-800">Domaines scientifiques</h2>
      <p className="text-brand.gray-600 max-w-3xl">
        Baol Academic Journal couvre des domaines clés inspirés du modèle académique MMEP (iieta.org), avec une emphase sur l'innovation et la rigueur scientifique.
      </p>
      <DomainsSection />
    </div>
  );
}
