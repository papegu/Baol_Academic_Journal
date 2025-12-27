export default function PaymentFailurePage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4 text-red-700">Échec du paiement</h1>
      <p className="text-sm text-gray-700 mb-6">
        Nous n'avons pas pu confirmer votre paiement. Vous pouvez réessayer ou envoyer une preuve de paiement pour vérification.
      </p>
      <div className="flex items-center gap-3">
        <a href="/dashboard/author/payment" className="bg-green-700 text-white px-4 py-2 rounded font-semibold">Réessayer le paiement</a>
        <a href="/payment/notification" className="bg-blue-700 text-white px-4 py-2 rounded font-semibold">Envoyer une preuve</a>
      </div>
    </div>
  );
}
