"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [view, setView] = useState<'OVERVIEW'|'SUBMISSIONS'>('OVERVIEW');
  const [articles, setArticles] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>('SUBMITTED');
  const [authors, setAuthors] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [conferences, setConferences] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [editingAuthor, setEditingAuthor] = useState<any | null>(null);
  const [editingConference, setEditingConference] = useState<any | null>(null);
  const [editingJournal, setEditingJournal] = useState<any | null>(null);
  const [editingDomain, setEditingDomain] = useState<any | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewerKey, setViewerKey] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
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

  const fetchSubmissions = async () => {
    try {
      const q = submissionStatusFilter ? `?status=${encodeURIComponent(submissionStatusFilter)}` : '';
      const res = await fetch('/api/submissions' + q);
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch {}
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
    fetchSubmissions();
    fetchAuthors();
    fetchBooks();
    fetchTransactions();
    fetchConferences();
    fetchJournals();
    fetchDomains();
  }, []);

  useEffect(() => {
    if (view === 'SUBMISSIONS') fetchSubmissions();
  }, [view, submissionStatusFilter]);

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
  const visibleArticles = filterStatus ? articles.filter(a => a.status === filterStatus) : articles;

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
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setView('OVERVIEW')} className={`text-sm px-3 py-1 rounded ${view==='OVERVIEW'?'bg-brand-blue-600 text-white':'bg-brand-gray-200 text-brand-gray-800'}`}>Overview</button>
        <button type="button" onClick={() => setView('SUBMISSIONS')} className={`text-sm px-3 py-1 rounded ${view==='SUBMISSIONS'?'bg-brand-blue-600 text-white':'bg-brand-gray-200 text-brand-gray-800'}`}>Submission</button>
      </div>
      {view==='OVERVIEW' && (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button type="button" onClick={() => setFilterStatus('SUBMITTED')} className={`bg-white border rounded-lg shadow-sm p-4 text-left ${filterStatus==='SUBMITTED'?'ring-2 ring-brand-blue-600':''}`}>
          <div className="text-xs uppercase tracking-wide text-brand-gray-500">Soumis</div>
          <div className="text-2xl font-bold text-brand-gray-800">{submitted}</div>
        </button>
        <button type="button" onClick={() => setFilterStatus('ACCEPTED')} className={`bg-white border rounded-lg shadow-sm p-4 text-left ${filterStatus==='ACCEPTED'?'ring-2 ring-brand-blue-600':''}`}>
          <div className="text-xs uppercase tracking-wide text-brand-gray-500">Acceptés</div>
          <div className="text-2xl font-bold text-brand-gray-800">{accepted}</div>
        </button>
        <button type="button" onClick={() => setFilterStatus('PUBLISHED')} className={`bg-white border rounded-lg shadow-sm p-4 text-left ${filterStatus==='PUBLISHED'?'ring-2 ring-brand-blue-600':''}`}>
          <div className="text-xs uppercase tracking-wide text-brand-gray-500">Publiés</div>
          <div className="text-2xl font-bold text-brand-gray-800">{published}</div>
        </button>
      </div>
      )}
      {view==='OVERVIEW' && (
        <>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        {loading ? (
          <div className="text-gray-500">Chargement…</div>
        ) : visibleArticles.length === 0 ? (
          <div className="text-gray-500">Aucun article à valider.</div>
        ) : (
          <ul className="space-y-4">
            {visibleArticles.map((article: any) => (
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
                <div className="mt-2">
                  <button
                    onClick={() => setEditingArticle(article)}
                    className="bg-brand-gray-200 text-brand-gray-800 px-3 py-1 rounded hover:bg-brand-gray-300"
                  >Modifier</button>
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
        </>
      )}

      {view==='SUBMISSIONS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm text-brand-gray-700">Filtrer:</label>
              <select value={submissionStatusFilter} onChange={e=>setSubmissionStatusFilter(e.target.value)} className="text-sm border rounded px-2 py-1">
                <option value="SUBMITTED">Soumis</option>
                <option value="ACCEPTED">Acceptés</option>
                <option value="PUBLISHED">Publiés</option>
                <option value="REJECTED">Rejetés</option>
                <option value="">Tous</option>
              </select>
            </div>
            <button className="text-sm px-2 py-1 rounded bg-brand-gray-200" onClick={()=>fetchSubmissions()}>Actualiser</button>
          </div>
          <section className="bg-white border rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-brand-gray-800 mb-3">Liste des articles soumis</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 px-2">Titre</th>
                    <th className="py-2 px-2">Auteurs</th>
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Statut</th>
                    <th className="py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s:any)=> (
                    <tr key={s.id} className="border-b">
                      <td className="py-2 px-2">{s.title}</td>
                      <td className="py-2 px-2">{s.authors}</td>
                      <td className="py-2 px-2">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-2">{s.status}</td>
                      <td className="py-2 px-2 space-x-2">
                        <button className="bg-brand-green-600 text-white px-2 py-1 rounded" onClick={()=> setConfirmApproveId(s.id)}>Valider</button>
                        <button className="bg-brand-gray-200 text-brand-gray-800 px-2 py-1 rounded" onClick={()=> setEditingSubmission(s)}>Modifier</button>
                        <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={()=> setConfirmDeleteSubmissionId(s.id)}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white border rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-brand-gray-800 mb-3">Liste des articles publiés</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 px-2">Titre</th>
                    <th className="py-2 px-2">Date de publication</th>
                    <th className="py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.filter(a=>a.status==='PUBLISHED').map((a:any)=> (
                    <tr key={a.id} className="border-b">
                      <td className="py-2 px-2">{a.title}</td>
                      <td className="py-2 px-2">{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-2 space-x-2">
                        <button className="bg-brand-gray-200 text-brand-gray-800 px-2 py-1 rounded" onClick={()=> setEditingArticle(a)}>Modifier</button>
                        <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={()=> setConfirmDeleteArticleId(a.id)}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white border rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-brand-gray-800 mb-3">Ajout d’un nouvel article</h3>
            <form
              onSubmit={async (e)=>{
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                const abstract = (form.elements.namedItem('abstract') as HTMLInputElement).value;
                const authors = (form.elements.namedItem('authors') as HTMLInputElement).value;
                const fileInput = form.elements.namedItem('file') as HTMLInputElement | null;
                const file = fileInput?.files?.[0] || null;
                const fd = new FormData();
                fd.append('title', title);
                fd.append('abstract', abstract);
                fd.append('authors', authors);
                if (file) fd.append('file', file);
                const res = await fetch('/api/submissions', { method:'POST', body: fd });
                if (res.ok) { fetchSubmissions(); form.reset?.call(form); }
              }}
              className="space-y-2"
            >
              <input name="title" placeholder="Titre" className="w-full border px-3 py-2 rounded" />
              <input name="abstract" placeholder="Résumé" className="w-full border px-3 py-2 rounded" />
              <input name="authors" placeholder="Auteurs" className="w-full border px-3 py-2 rounded" />
              <input name="file" type="file" accept="application/pdf" className="w-full border px-3 py-2 rounded" />
              <button className="bg-brand-blue-600 text-white px-3 py-1 rounded">Ajouter</button>
            </form>
          </section>
        </div>
      )}

      {/* Confirm Approve Submission */}
      {confirmApproveId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] max-w-md rounded shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b font-semibold">Valider la soumission</div>
            <div className="p-4 text-sm">Confirmez-vous la validation de cette soumission ? Elle sera publiée immédiatement.</div>
            <div className="p-4 flex justify-end gap-2">
              <button className="px-3 py-1 rounded bg-brand-gray-200" onClick={()=>setConfirmApproveId(null)}>Annuler</button>
              <button className="px-3 py-1 rounded bg-brand-green-600 text-white" onClick={async()=>{ const id = confirmApproveId!; setConfirmApproveId(null); await fetch(`/api/submissions/${id}/approve`, { method:'POST' }); fetchSubmissions(); fetchArticles(); }}>Valider</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Submission */}
      {confirmDeleteSubmissionId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] max-w-md rounded shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b font-semibold">Supprimer la soumission</div>
            <div className="p-4 text-sm">Voulez-vous vraiment supprimer définitivement cette soumission ?</div>
            <div className="p-4 flex justify-end gap-2">
              <button className="px-3 py-1 rounded bg-brand-gray-200" onClick={()=>setConfirmDeleteSubmissionId(null)}>Annuler</button>
              <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={async()=>{ const id = confirmDeleteSubmissionId!; setConfirmDeleteSubmissionId(null); await fetch(`/api/submissions/${id}`, { method:'DELETE' }); fetchSubmissions(); }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Article */}
      {confirmDeleteArticleId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] max-w-md rounded shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b font-semibold">Supprimer l'article</div>
            <div className="p-4 text-sm">Confirmez-vous la suppression de l'article publié ?</div>
            <div className="p-4 flex justify-end gap-2">
              <button className="px-3 py-1 rounded bg-brand-gray-200" onClick={()=>setConfirmDeleteArticleId(null)}>Annuler</button>
              <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={async()=>{ const id = confirmDeleteArticleId!; setConfirmDeleteArticleId(null); await fetch(`/api/articles`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, status: 'REJECTED' }) }); fetchArticles(); }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Submission Modal */}
      {editingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] max-w-xl rounded shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="font-semibold text-brand-gray-800 truncate">Modifier la soumission</div>
              <button onClick={() => setEditingSubmission(null)} className="text-sm px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Fermer</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                const authors = (form.elements.namedItem('authors') as HTMLInputElement).value;
                const abstract = (form.elements.namedItem('abstract') as HTMLInputElement).value;
                await fetch(`/api/submissions/${editingSubmission.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, authors, abstract }) });
                setEditingSubmission(null);
                fetchSubmissions();
              }}
              className="p-4 space-y-3"
            >
              <input name="title" defaultValue={editingSubmission.title} placeholder="Titre" className="w-full border px-3 py-2 rounded" />
              <input name="authors" defaultValue={editingSubmission.authors} placeholder="Auteurs" className="w-full border px-3 py-2 rounded" />
              <input name="abstract" defaultValue={editingSubmission.abstract} placeholder="Résumé" className="w-full border px-3 py-2 rounded" />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingSubmission(null)} className="px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Annuler</button>
                <button type="submit" className="bg-brand-blue-600 text-white px-3 py-1 rounded">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
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
                  <button className="text-sm px-2 py-1 bg-brand-gray-200 rounded" onClick={() => setEditingAuthor(a)}>Modifier</button>
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
                  <button className="text-sm px-2 py-1 bg-brand-gray-200 rounded" onClick={() => setEditingBook(b)}>Modifier</button>
                  {b?.published ? (
                    <button className="text-sm px-2 py-1 bg-red-600 text-white rounded" onClick={async () => { await fetch(`/api/books/${b.id}`, { method: 'DELETE' }); fetchBooks(); }}>Supprimer</button>
                  ) : null}
                  <button
                    className="text-sm px-2 py-1 rounded bg-brand-blue-600 text-white"
                    onClick={async () => {
                      const next = !b.published;
                      await fetch(`/api/books/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: next }) });
                      fetchBooks();
                    }}
                  >{b?.published ? 'Dépublier' : 'Publier'}</button>
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
                  <button className="text-sm px-2 py-1 bg-brand-gray-200 rounded" onClick={() => setEditingTransaction(t)}>Modifier</button>
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
                  <button className="text-sm px-2 py-1 bg-brand-gray-200 rounded" onClick={() => setEditingConference(c)}>Modifier</button>
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
                  <button className="text-sm px-2 py-1 bg-brand-gray-200 rounded" onClick={() => setEditingJournal(j)}>Modifier</button>
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
                  <button className="text-sm px-2 py-1 bg-brand-gray-200 rounded" onClick={() => setEditingDomain(d)}>Modifier</button>
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
                src={`/api/articles/pdf?key=${encodeURIComponent(viewerKey || '')}`}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] max-w-xl rounded shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="font-semibold text-brand-gray-800 truncate">Modifier l'article</div>
              <button onClick={() => setEditingArticle(null)} className="text-sm px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Fermer</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                const authors = (form.elements.namedItem('authors') as HTMLInputElement).value;
                const abstract = (form.elements.namedItem('abstract') as HTMLInputElement).value;
                const res = await fetch(`/api/articles`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingArticle.id, title, authors, abstract }) });
                if (res.ok) { setEditingArticle(null); fetchArticles(); }
              }}
              className="p-4 space-y-3"
            >
              <input name="title" defaultValue={editingArticle.title} placeholder="Titre" className="w-full border px-3 py-2 rounded" />
              <input name="authors" defaultValue={editingArticle.authors} placeholder="Auteurs" className="w-full border px-3 py-2 rounded" />
              <input name="abstract" defaultValue={editingArticle.abstract} placeholder="Résumé" className="w-full border px-3 py-2 rounded" />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingArticle(null)} className="px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Annuler</button>
                <button type="submit" className="bg-brand-blue-600 text-white px-3 py-1 rounded">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] max-w-xl rounded shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="font-semibold text-brand-gray-800 truncate">Modifier le livre</div>
              <button onClick={() => setEditingBook(null)} className="text-sm px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Fermer</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                const authors = (form.elements.namedItem('authors') as HTMLInputElement).value;
                const description = (form.elements.namedItem('description') as HTMLInputElement).value;
                const res = await fetch(`/api/books/${editingBook.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, authors, description }) });
                if (res.ok) {
                  setEditingBook(null);
                  fetchBooks();
                }
              }}
              className="p-4 space-y-3"
            >
              <input name="title" defaultValue={editingBook.title} placeholder="Titre" className="w-full border px-3 py-2 rounded" />
              <input name="authors" defaultValue={editingBook.authors} placeholder="Auteurs" className="w-full border px-3 py-2 rounded" />
              <input name="description" defaultValue={editingBook.description} placeholder="Description" className="w-full border px-3 py-2 rounded" />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingBook(null)} className="px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Annuler</button>
                <button type="submit" className="bg-brand-blue-600 text-white px-3 py-1 rounded">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] max-w-xl rounded shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="font-semibold text-brand-gray-800 truncate">Modifier l'auteur</div>
              <button onClick={() => setEditingAuthor(null)} className="text-sm px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Fermer</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                const res = await fetch(`/api/users/${editingAuthor.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }) });
                if (res.ok) { setEditingAuthor(null); fetchAuthors(); }
              }}
              className="p-4 space-y-3"
            >
              <input name="name" defaultValue={editingAuthor.name} placeholder="Nom" className="w-full border px-3 py-2 rounded" />
              <input name="email" defaultValue={editingAuthor.email} placeholder="Email" className="w-full border px-3 py-2 rounded" />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingAuthor(null)} className="px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Annuler</button>
                <button type="submit" className="bg-brand-blue-600 text-white px-3 py-1 rounded">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingConference && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] max-w-xl rounded shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="font-semibold text-brand-gray-800 truncate">Modifier la conférence</div>
              <button onClick={() => setEditingConference(null)} className="text-sm px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Fermer</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                const location = (form.elements.namedItem('location') as HTMLInputElement).value;
                const date = (form.elements.namedItem('date') as HTMLInputElement).value;
                const description = (form.elements.namedItem('description') as HTMLInputElement).value;
                const res = await fetch(`/api/conferences/${editingConference.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, location, date, description }) });
                if (res.ok) { setEditingConference(null); fetchConferences(); }
              }}
              className="p-4 space-y-3"
            >
              <input name="name" defaultValue={editingConference.name} placeholder="Nom" className="w-full border px-3 py-2 rounded" />
              <input name="location" defaultValue={editingConference.location || ''} placeholder="Lieu" className="w-full border px-3 py-2 rounded" />
              <input name="date" defaultValue={editingConference.date || ''} placeholder="Date (ISO)" className="w-full border px-3 py-2 rounded" />
              <input name="description" defaultValue={editingConference.description || ''} placeholder="Description" className="w-full border px-3 py-2 rounded" />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingConference(null)} className="px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Annuler</button>
                <button type="submit" className="bg-brand-blue-600 text-white px-3 py-1 rounded">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] max-w-xl rounded shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="font-semibold text-brand-gray-800 truncate">Modifier le journal</div>
              <button onClick={() => setEditingJournal(null)} className="text-sm px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Fermer</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                const issn = (form.elements.namedItem('issn') as HTMLInputElement).value;
                const url = (form.elements.namedItem('url') as HTMLInputElement).value;
                const res = await fetch(`/api/journals/${editingJournal.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, issn, url }) });
                if (res.ok) { setEditingJournal(null); fetchJournals(); }
              }}
              className="p-4 space-y-3"
            >
              <input name="name" defaultValue={editingJournal.name} placeholder="Nom" className="w-full border px-3 py-2 rounded" />
              <input name="issn" defaultValue={editingJournal.issn || ''} placeholder="ISSN" className="w-full border px-3 py-2 rounded" />
              <input name="url" defaultValue={editingJournal.url || ''} placeholder="URL" className="w-full border px-3 py-2 rounded" />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingJournal(null)} className="px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Annuler</button>
                <button type="submit" className="bg-brand-blue-600 text-white px-3 py-1 rounded">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] max-w-xl rounded shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="font-semibold text-brand-gray-800 truncate">Modifier le domaine</div>
              <button onClick={() => setEditingDomain(null)} className="text-sm px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Fermer</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                const res = await fetch(`/api/domains/${editingDomain.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
                if (res.ok) { setEditingDomain(null); fetchDomains(); }
              }}
              className="p-4 space-y-3"
            >
              <input name="name" defaultValue={editingDomain.name} placeholder="Nom" className="w-full border px-3 py-2 rounded" />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingDomain(null)} className="px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Annuler</button>
                <button type="submit" className="bg-brand-blue-600 text-white px-3 py-1 rounded">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] max-w-xl rounded shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="font-semibold text-brand-gray-800 truncate">Modifier la transaction</div>
              <button onClick={() => setEditingTransaction(null)} className="text-sm px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Fermer</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const reference = (form.elements.namedItem('reference') as HTMLInputElement).value;
                const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
                const status = (form.elements.namedItem('status') as HTMLSelectElement).value;
                const res = await fetch(`/api/transactions/${editingTransaction.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference, amount, status }) });
                if (res.ok) { setEditingTransaction(null); fetchTransactions(); }
              }}
              className="p-4 space-y-3"
            >
              <input name="reference" defaultValue={editingTransaction.reference} placeholder="Référence" className="w-full border px-3 py-2 rounded" />
              <input name="amount" defaultValue={String(editingTransaction.amount)} placeholder="Montant" type="number" step="0.01" className="w-full border px-3 py-2 rounded" />
              <select name="status" defaultValue={editingTransaction.status} className="w-full border px-3 py-2 rounded">
                <option value="PENDING">En attente</option>
                <option value="PAID">Payé</option>
                <option value="FAILED">Échoué</option>
              </select>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingTransaction(null)} className="px-3 py-1 rounded bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-800">Annuler</button>
                <button type="submit" className="bg-brand-blue-600 text-white px-3 py-1 rounded">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
