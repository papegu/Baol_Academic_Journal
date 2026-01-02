"use client";
import { useState } from "react";

export default function AuthorPaymentPage() {
  const [amount, setAmount] = useState<number>(500);
  const [description, setDescription] = useState<string>("Frais de publication BAJP");
  const [link, setLink] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function startPayment() {
    setLoading(true);
    setMsg("");
    setLink("");
    try {
      const res = await fetch("/api/paytech/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "USD", description })
      });
      const data = await res.json();
      if (res.ok && data?.url) {
        setLink(data.url);
      } else {
        const lastAttempt = data.debug?.attempts?.[data.debug.attempts.length - 1];
        const providerText = typeof lastAttempt?.body === 'string' ? lastAttempt.body.trim() : '';
        setMsg((data?.reason || providerText || "Échec de l'initialisation du paiement") + (providerText ? ` — Provider: ${providerText}` : ''));
        if (data.debug) {
          console.error('PayTech initiation debug', data.debug);
        }
      }
    } catch (e) {
      setMsg("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-brand-gray-800">Paiement des frais de publication</h2>
      <p className="text-brand-gray-700">Régler vos frais de publication directement en ligne.</p>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Montant (USD)</label>
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="border px-3 py-2 rounded w-full" />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Description</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="border px-3 py-2 rounded w-full" />
      </div>
      <button onClick={startPayment} disabled={loading} className="bg-brand-blue-600 text-white px-4 py-2 rounded">
        {loading ? "Initialisation…" : "Générer un lien de paiement"}
      </button>
      {msg && <p className="text-brand-gray-700">{msg}</p>}
      {link && (
        <div className="space-y-2">
          <p className="text-brand-gray-700">Lien de paiement généré :</p>
          <a href={link} target="_blank" rel="noreferrer" className="text-brand-blue-600 underline">Payer maintenant</a>
        </div>
      )}
    </div>
  );
}
