"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [conferences, setConferences] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewerKey, setViewerKey] = useState<string | null>(null);
  const router = useRouter();

  // Mock : vérifie le rôle dans localStorage (à remplacer par une vraie auth plus tard)
  useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    if (role !== 'ADMIN' && role !== 'EDITOR') {
      router.replace('/login');
    }
  }, [router]);

  const fetchArticles = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/articles?status=SUBMITTED').then(r => r.json()),
      fetch('/api/articles?status=ACCEPTED').then(r => r.json()),
      fetch('/api/articles?status=PUBLISHED').then(r => r.json()),
    ]).then(([s, a, p]) => {
      const merged = [...(s.articles || []), ...(a.articles || []), ...(p.articles || [])];
      setArticles(merged);
      setLoading(false);
    });
  };

  const fetchAuthors = async () => {
    try {
      const res = await fetch('/api/users?role=AUTHOR');
      const data = await res.json();
      setAuthors(data.users || []);
    } catch {}
  };

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(data.books || []);
    } catch {}
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch {}
  };

  const fetchConferences = async () => {
    try {
      const res = await fetch('/api/conferences');
      const data = await res.json();
      setConferences(data.conferences || []);
    } catch {}
  };

  const fetchJournals = async () => {
    try {
      const res = await fetch('/api/journals');
      const data = await res.json();
      setJournals(data.journals || []);
    } catch {}
  };

  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/domains');
      const data = await res.json();
      setDomains(data.domains || []);
    } catch {}
  };

  useEffect(() => {
    fetchArticles();
    fetchAuthors();
    fetchBooks();
    fetchTransactions();
    fetchConferences();
    fetchJournals();
    fetchDomains();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    setError('');
    try {
      const res = await fetch('/api/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchArticles();
      } else {
        const data = await res.json();
        setError(data.message || 'Erreur');
      }
    } catch {
      setError('Erreur réseau');
    }
  };

  const submitted = articles.filter(a => a.status === 'SUBMITTED').length;
  const accepted = articles.filter(a => a.status === 'ACCEPTED').length;
  const published = articles.filter(a => a.status === 'PUBLISHED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-brand-gray-800">Espace Administration</h2>
        <button
          type="button"
          onClick={() => {
            document.cookie = 'role=; Max-Age=0; path=/';
            document.cookie = 'access_token=; Max-Age=0; path=/';
            try { localStorage.removeItem('role'); localStorage.removeItem('access_token'); } catch {}
            router.replace('/login');
          }}
          className="text-sm px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800"
        >Déconnexion</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="text-xs uppercase tracking-wide text-brand-gray-500">Soumis</div>
          <div className="text-2xl font-bold text-brand-gray-800">{submitted}</div>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="text-xs uppercase tracking-wide text-brand-gray-500">Acceptés</div>
          <div className="text-2xl font-bold text-brand-gray-800">{accepted}</div>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="text-xs uppercase tracking-wide text-brand-gray-500">Publiés</div>
          <div className="text-2xl font-bold text-brand-gray-800">{published}</div>
        </div>
      </div>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-500">Chargement…</div>
      ) : articles.length === 0 ? (
        <div className="text-gray-500">Aucun article à valider.</div>
      ) : (
        <ul className="space-y-4">
          {articles.map((article: any) => (
            <li key={article.id} className="border p-4 rounded bg-white shadow-sm">
              <div className="font-semibold text-brand-gray-800">{article.title}</div>
              <div className="text-sm text-brand-gray-600">{article.authors}</div>
              <div className="text-xs text-brand-gray-500">Statut : {article.status}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {article?.pdfUrl ? (
                  <>
                    <button
                      onClick={() => setViewerKey(article.pdfUrl)}
                      className="bg-brand-gray-200 text-brand-gray-800 px-3 py-1 rounded hover:bg-brand-gray-300"
                    >Lire le PDF</button>
                    <a
                      href={`/api/articles/pdf/${article.pdfUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-brand-gray-200 text-brand-gray-800 px-3 py-1 rounded hover:bg-brand-gray-300"
                    >Ouvrir dans un onglet</a>
                  </>
                ) : (
                  <span className="text-xs text-brand-gray-500">Aucun PDF associé</span>
                )}
              </div>
              {article.status === 'SUBMITTED' && (
                <>
                  <button onClick={() => updateStatus(article.id, 'ACCEPTED')} className="bg-brand-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-brand-green-700">Accepter</button>
                  <button onClick={() => updateStatus(article.id, 'REJECTED')} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Rejeter</button>
                </>
              )}
              {article.status === 'ACCEPTED' && (
                <button onClick={() => updateStatus(article.id, 'PUBLISHED')} className="bg-brand-blue-600 text-white px-3 py-1 rounded hover:bg-brand-blue-700">Publier</button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-brand-gray-800 mb-3">Auteurs</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const name = (form.elements.namedItem('name') as HTMLInputElement).value;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              const password = (form.elements.namedItem('password') as HTMLInputElement).value;
              const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, role: 'AUTHOR', password }) });
              if (res.ok) { fetchAuthors(); (form.elements.namedItem('name') as HTMLInputElement).value = ''; (form.elements.namedItem('email') as HTMLInputElement).value=''; (form.elements.namedItem('password') as HTMLInputElement).value=''; }
            }}
            className="space-y-2 mb-3"
          >
            <input name="name" placeholder="Nom" className="w-full border px-3 py-2 rounded" />
            <input name="email" placeholder="Email" className="w-full border px-3 py-2 rounded" />
            <input name="password" type="password" placeholder="Mot de passe" className="w-full border px-3 py-2 rounded" />
            <button className="bg-brand-blue-600 text-white px-3 py-1 rounded">Ajouter</button>
          </form>
          <ul className="space-y-2">
            {authors.map((a: any) => (
              <li key={a.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-sm text-brand-gray-600">{a.email}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm px-2 py-1 bg-brand-gray-200 rounded" onClick={async () => {
                    const name = prompt('Nouveau nom', a.name) || a.name;
                    await fetch(`/api/users/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
                    fetchAuthors();
                  }}>Modifier</button>
                  <button className="text-sm px-2 py-1 bg-red-600 text-white rounded" onClick={async () => { await fetch(`/api/users/${a.id}`, { method: 'DELETE' }); fetchAuthors(); }}>Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-brand-gray-800 mb-3">Livres</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const title = (form.elements.namedItem('title') as HTMLInputElement).value;
              const authors = (form.elements.namedItem('authors') as HTMLInputElement).value;
              const description = (form.elements.namedItem('description') as HTMLInputElement).value;
              const fileInput = form.elements.namedItem('file') as HTMLInputElement | null;
              const file = fileInput?.files?.[0] || null;
              const fd = new FormData();
              fd.append('title', title);
              fd.append('authors', authors);
              fd.append('description', description);
              if (file) fd.append('file', file);
              const res = await fetch('/api/books', { method: 'POST', body: fd });
              if (res.ok) {
                fetchBooks();
                (form.elements.namedItem('title') as HTMLInputElement).value='';
                (form.elements.namedItem('authors') as HTMLInputElement).value='';
                (form.elements.namedItem('description') as HTMLInputElement).value='';
                if (fileInput) fileInput.value = '';
              }
            }}
            className="space-y-2 mb-3"
          >
            <input name="title" placeholder="Titre" className="w-full border px-3 py-2 rounded" />
            <input name="authors" placeholder="Auteurs" className="w-full border px-3 py-2 rounded" />
            <input name="description" placeholder="Description" className="w-full border px-3 py-2 rounded" />
            <input name="file" type="file" accept="application/pdf" className="w-full border px-3 py-2 rounded" />
            <button className="bg-brand-blue-600 text-white px-3 py-1 rounded">Ajouter</button>
          </form>
          <ul className="space-y-2">
            {books.map((b: any) => (
              <li key={b.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{b.title}</div>
                  <div className="text-sm text-brand-gray-600">{b.authors}</div>
                  {b?.pdfUrl ? (
                    <div className="mt-1">
                      <button className="text-sm px-2 py-1 bg-brand-gray-200 rounded mr-2" onClick={() => setViewerKey(b.pdfUrl)}>Lire le PDF</button>
                      <a href={`/api/books/pdf?key=${encodeURIComponent(b.pdfUrl)}`} target="_blank" rel="noopener noreferrer" className="text-sm px-2 py-1 bg-brand-gray-200 rounded">Ouvrir dans un onglet</a>
                    </div>
                  ) : (
                    <div className="text-xs text-brand-gray-500">Aucun PDF</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="text-sm px-2 py-1 bg-brand-gray-200 rounded" onClick={async () => {
                    const title = prompt('Nouveau titre', b.title) || b.title;
                    await fetch(`/api/books/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) });
                    fetchBooks();
                  }}>Modifier</button>
                  <button className="text-sm px-2 py-1 bg-red-600 text-white rounded" onClick={async () => { await fetch(`/api/books/${b.id}`, { method: 'DELETE' }); fetchBooks(); }}>Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-brand-gray-800 mb-3">Transactions</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const reference = (form.elements.namedItem('reference') as HTMLInputElement).value;
              const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
              const status = (form.elements.namedItem('status') as HTMLSelectElement).value;
              const date = new Date().toISOString();
              const res = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference, amount, status, date }) });
              if (res.ok) { fetchTransactions(); (form.elements.namedItem('reference') as HTMLInputElement).value=''; (form.elements.namedItem('amount') as HTMLInputElement).value=''; }
            }}
            className="space-y-2 mb-3"
          >
            <input name="reference" placeholder="Référence" className="w-full border px-3 py-2 rounded" />
            <input name="amount" placeholder="Montant" type="number" step="0.01" className="w-full border px-3 py-2 rounded" />
            <select name="status" className="w-full border px-3 py-2 rounded">
              <option value="PENDING">En attente</option>
              <option value="PAID">Payé</option>
              <option value="FAILED">Échoué</option>
            </select>
            <button className="bg-brand-blue-600 text-white px-3 py-1 rounded">Ajouter</button>
          </form>
          <ul className="space-y-2">
            {transactions.map((t: any) => (
              <li key={t.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.reference} — {t.amount} CFA</div>
                  <div className="text-sm text-brand-gray-600">{t.status}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm px-2 py-1 bg-brand-gray-200 rounded" onClick={async () => {
                    const status = prompt('Nouveau statut (PENDING/PAID/FAILED)', t.status) || t.status;
                    await fetch(`/api/transactions/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
                    fetchTransactions();
                  }}>Modifier</button>
                  <button className="text-sm px-2 py-1 bg-red-600 text-white rounded" onClick={async () => { await fetch(`/api/transactions/${t.id}`, { method: 'DELETE' }); fetchTransactions(); }}>Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-brand-gray-800 mb-3">Paiements passés</h3>
          <button
            className="mb-3 bg-brand-gray-200 px-3 py-1 rounded"
            onClick={async () => {
              const res = await fetch('/api/payments');
              const data = await res.json();
              alert(`Paiements: ${data.payments?.length || 0}`);
            }}
          >Actualiser</button>
          <p className="text-sm text-brand-gray-600">Liste accessible via `/api/payments`.</p>
        </section>

        <section className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-brand-gray-800 mb-3">Conférences</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const name = (form.elements.namedItem('name') as HTMLInputElement).value;
            const location = (form.elements.namedItem('location') as HTMLInputElement).value;
            const date = (form.elements.namedItem('date') as HTMLInputElement).value;
            const description = (form.elements.namedItem('description') as HTMLInputElement).value;
            const res = await fetch('/api/conferences', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, location, date, description }) });
            if (res.ok) { fetchConferences(); (form.reset?.call(form)); }
          }} className="space-y-2 mb-3">
            <input name="name" placeholder="Nom" className="w-full border px-3 py-2 rounded" />
            <input name="location" placeholder="Lieu" className="w-full border px-3 py-2 rounded" />
            <input name="date" placeholder="Date (ISO)" className="w-full border px-3 py-2 rounded" />
            <input name="description" placeholder="Description" className="w-full border px-3 py-2 rounded" />
            <button className="bg-brand-blue-600 text-white px-3 py-1 rounded">Ajouter</button>
          </form>
          <ul className="space-y-2">
            {conferences.map((c: any) => (
              <li key={c.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-brand-gray-600">{c.location} {c.date}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm px-2 py-1 bg-brand-gray-200 rounded" onClick={async () => {
                    const name = prompt('Nouveau nom', c.name) || c.name;
                    await fetch(`/api/conferences/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
                    fetchConferences();
                  }}>Modifier</button>
                  <button className="text-sm px-2 py-1 bg-red-600 text-white rounded" onClick={async () => { await fetch(`/api/conferences/${c.id}`, { method: 'DELETE' }); fetchConferences(); }}>Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-brand-gray-800 mb-3">Journaux</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const name = (form.elements.namedItem('name') as HTMLInputElement).value;
            const issn = (form.elements.namedItem('issn') as HTMLInputElement).value;
            const url = (form.elements.namedItem('url') as HTMLInputElement).value;
            const domain = (form.elements.namedItem('domain') as HTMLInputElement).value;
            const res = await fetch('/api/journals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, issn, url, domain }) });
            if (res.ok) { fetchJournals(); (form.reset?.call(form)); }
          }} className="space-y-2 mb-3">
            <input name="name" placeholder="Nom" className="w-full border px-3 py-2 rounded" />
            <input name="issn" placeholder="ISSN" className="w-full border px-3 py-2 rounded" />
            <input name="url" placeholder="URL" className="w-full border px-3 py-2 rounded" />
            <input name="domain" placeholder="Domaine" className="w-full border px-3 py-2 rounded" />
            <button className="bg-brand-blue-600 text-white px-3 py-1 rounded">Ajouter</button>
          </form>
          <ul className="space-y-2">
            {journals.map((j: any) => (
              <li key={j.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{j.name}</div>
                  <div className="text-sm text-brand-gray-600">{j.issn} {j.url}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm px-2 py-1 bg-brand-gray-200 rounded" onClick={async () => {
                    const name = prompt('Nouveau nom', j.name) || j.name;
                    await fetch(`/api/journals/${j.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
                    fetchJournals();
                  }}>Modifier</button>
                  <button className="text-sm px-2 py-1 bg-red-600 text-white rounded" onClick={async () => { await fetch(`/api/journals/${j.id}`, { method: 'DELETE' }); fetchJournals(); }}>Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-brand-gray-800 mb-3">Domaines</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const name = (form.elements.namedItem('name') as HTMLInputElement).value;
            const res = await fetch('/api/domains', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
            if (res.ok) { fetchDomains(); (form.reset?.call(form)); }
          }} className="space-y-2 mb-3">
            <input name="name" placeholder="Nom" className="w-full border px-3 py-2 rounded" />
            <button className="bg-brand-blue-600 text-white px-3 py-1 rounded">Ajouter</button>
          </form>
          <ul className="space-y-2">
            {domains.map((d: any) => (
              <li key={d.id} className="flex items-center justify-between">
                <div className="font-medium">{d.name}</div>
                <div className="flex gap-2">
                  <button className="text-sm px-2 py-1 bg-brand-gray-200 rounded" onClick={async () => {
                    const name = prompt('Nouveau nom', d.name) || d.name;
                    await fetch(`/api/domains/${d.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
                    fetchDomains();
                  }}>Modifier</button>
                  <button className="text-sm px-2 py-1 bg-red-600 text-white rounded" onClick={async () => { await fetch(`/api/domains/${d.id}`, { method: 'DELETE' }); fetchDomains(); }}>Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="bg-white border rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-brand-gray-800 mb-3">Modifier le mot de passe de l'administrateur</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const currentPassword = (form.elements.namedItem('current') as HTMLInputElement).value;
            const newPassword = (form.elements.namedItem('new') as HTMLInputElement).value;
            const res = await fetch('/api/auth/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
            const data = await res.json();
            if (res.ok) { alert('Mot de passe modifié (mode démo)'); (form.elements.namedItem('current') as HTMLInputElement).value=''; (form.elements.namedItem('new') as HTMLInputElement).value=''; } else { alert(data.error || 'Erreur'); }
          }}
          className="space-y-2"
        >
          <input name="current" type="password" placeholder="Mot de passe actuel" className="w-full border px-3 py-2 rounded" />
          <input name="new" type="password" placeholder="Nouveau mot de passe" className="w-full border px-3 py-2 rounded" />
          <button className="bg-brand-blue-600 text-white px-3 py-1 rounded">Mettre à jour</button>
        </form>
        <p className="text-xs text-brand-gray-600 mt-2">Disponible uniquement en mode démo (DEMO_AUTH=true).</p>
      </section>

      {viewerKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] h-[90vh] max-w-5xl rounded shadow-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="font-semibold text-brand-gray-800 truncate">Lecture du PDF</div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/articles/pdf/${viewerKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800"
                >Ouvrir dans un onglet</a>
                <button
                  onClick={() => setViewerKey(null)}
                  className="text-sm px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800"
                >Fermer</button>
              </div>
            </div>
            <div className="flex-1">
              <iframe
                title="PDF Viewer"
                src={`/api/articles/pdf/${viewerKey}`}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
