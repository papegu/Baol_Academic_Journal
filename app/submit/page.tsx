"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [abstract, setAbstract] = useState('');
  const [file, setFile] = useState<File|null>(null);
  const [message, setMessage] = useState('');
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const roleCookie = document.cookie
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('role='));
    const isAuthed = !!roleCookie;
    setAuthenticated(isAuthed);
    if (!isAuthed) {
      const t = setTimeout(() => router.push('/login'), 1200);
      return () => clearTimeout(t);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!file) {
      setMessage('Veuillez sélectionner un fichier PDF.');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('authors', authors);
    formData.append('abstract', abstract);
    formData.append('file', file);
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setMessage('Soumission envoyée avec succès !');
      } else {
        const data = await res.json();
        setMessage(data.message || 'Erreur lors de la soumission');
      }
    } catch (err) {
      setMessage('Erreur réseau');
    }
  };

  if (authenticated === false) {
    return (
      <div className="max-w-lg mx-auto bg-white p-8 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Soumettre un article</h2>
        <p className="text-brand.gray-700 mb-2">Redirection vers la page de connexion…</p>
        <div className="flex gap-3 mb-4">
          <a className="text-brand.blue-600 underline" href="/login">Connexion</a>
          <a className="text-brand.blue-600 underline" href="/register">Inscription</a>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-brand.gray-800">Templates</h3>
          <ul className="list-disc pl-6 text-brand.gray-700 space-y-1">
            <li><a className="text-brand.blue-600 underline" href="/template_word.doc" download>Template Word (.doc)</a></li>
            <li><a className="text-brand.blue-600 underline" href="/template_word.tex" download>Template LaTeX (.tex)</a></li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Soumettre un article</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        <input type="text" placeholder="Auteurs" value={authors} onChange={e => setAuthors(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        <textarea placeholder="Résumé" value={abstract} onChange={e => setAbstract(e.target.value)} required className="w-full border px-3 py-2 rounded" />
        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} required className="w-full" />
        {message && <div className="text-green-600 text-sm">{message}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Soumettre</button>
      </form>
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-semibold text-brand.gray-800">Templates</h3>
        <ul className="list-disc pl-6 text-brand.gray-700 space-y-1">
          <li><a className="text-brand.blue-600 underline" href="/template_word.doc" download>Template Word (.doc)</a></li>
          <li><a className="text-brand.blue-600 underline" href="/template_word.tex" download>Template LaTeX (.tex)</a></li>
        </ul>
      </div>
    </div>
  );
}
