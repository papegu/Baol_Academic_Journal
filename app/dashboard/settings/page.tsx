"use client";
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [merchantKey, setMerchantKey] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setMerchantKey(localStorage.getItem('paytech_merchant_key') || '');
    setCallbackUrl(localStorage.getItem('paytech_callback_url') || '');
  }, []);

  const save = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('paytech_merchant_key', merchantKey);
    localStorage.setItem('paytech_callback_url', callbackUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-2xl font-bold text-brand-gray-800">Paramètres de paiement (PayTech)</h2>
      <p className="text-brand-gray-600 text-sm">Placeholders pour l'intégration PayTech. Ne stockez pas de clés sensibles côté client en production.</p>
      <div className="space-y-3 bg-white border rounded p-4">
        <label className="block text-sm text-brand-gray-700">Merchant Key</label>
        <input className="w-full border rounded px-3 py-2" value={merchantKey} onChange={e => setMerchantKey(e.target.value)} />
        <label className="block text-sm text-brand-gray-700 mt-3">Callback URL</label>
        <input className="w-full border rounded px-3 py-2" value={callbackUrl} onChange={e => setCallbackUrl(e.target.value)} />
        <button onClick={save} className="mt-4 bg-brand-blue-600 hover:bg-brand-blue-700 text-white px-4 py-2 rounded">Enregistrer</button>
        {saved && <div className="text-sm text-brand-green-600 mt-2">Paramètres enregistrés</div>}
      </div>
      <div className="text-sm text-brand-gray-600">
        Callback de test: <code className="px-1 py-0.5 bg-brand-gray-100 rounded">/api/paytech/callback?status=success&ref=BAJ-TEST-123</code>
      </div>
    </div>
  );
}
