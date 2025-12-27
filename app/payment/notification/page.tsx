"use client";
import { useState } from "react";

export default function PaymentNotificationPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/paytech/proof", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok) setStatus("Votre preuve de paiement a été envoyée.");
      else setStatus(json?.message || "Échec de l'envoi de la preuve.");
    } catch (err: any) {
      setStatus("Erreur réseau: " + (err?.message || ""));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Notification de paiement</h1>
      <p className="text-sm text-gray-600 mb-6">
        Veuillez renseigner les informations de votre paiement et joindre une preuve (reçu, capture d'écran).
      </p>

      {status && (
        <div className="mb-4 p-3 rounded bg-green-50 text-green-700 border border-green-200">{status}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label className="block text-sm font-medium mb-1">Référence de transaction</label>
          <input name="transactionId" required className="w-full border rounded px-3 py-2" placeholder="TX-123456" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email du payeur</label>
            <input name="payerEmail" type="email" required className="w-full border rounded px-3 py-2" placeholder="vous@exemple.org" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Montant</label>
            <input name="amount" type="number" step="0.01" required className="w-full border rounded px-3 py-2" placeholder="5000" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input name="description" className="w-full border rounded px-3 py-2" placeholder="Frais de soumission / publication" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Preuve de paiement (image/PDF)</label>
          <input name="proof" type="file" accept="image/*,application/pdf" required className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea name="notes" rows={4} className="w-full border rounded px-3 py-2" placeholder="Informations complémentaires (optionnel)"></textarea>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={submitting} className="bg-green-700 text-white px-4 py-2 rounded font-semibold">
            {submitting ? "Envoi..." : "Envoyer la preuve"}
          </button>
          <a href="/payment/failure" className="text-sm text-red-700 underline">Problème de paiement ?</a>
        </div>
      </form>
    </div>
  );
}
