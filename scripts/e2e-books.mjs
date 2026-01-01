import crypto from 'node:crypto';

const URL = process.env.URL || 'https://baol-academic-journal.vercel.app';

async function getCookieHeader() {
  const res = await fetch(URL + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@senegal-livres.sn', password: 'admin@#$%' }),
  });
  if (!res.ok) throw new Error('Admin login failed: ' + res.status);
  const cookiesArr = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
  const cookieHeader = cookiesArr.map(c => (c || '').split(';')[0]).filter(Boolean).join('; ');
  return cookieHeader;
}

function makeMinimalPdfBytes() {
  const pdf = `%PDF-1.1\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 72 72 Td (Hello, BAJP!) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000061 00000 n \n0000000127 00000 n \n0000000221 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n316\n%%EOF`;
  const enc = new TextEncoder();
  return enc.encode(pdf);
}

async function main() {
  const cookieHeader = await getCookieHeader();

  // Upload a book via multipart
  const form = new FormData();
  form.append('title', 'E2E Test Book');
  form.append('authors', 'Admin');
  form.append('description', 'Minimal PDF for R2 e2e test');
  const pdf = makeMinimalPdfBytes();
  const blob = new Blob([pdf], { type: 'application/pdf' });
  form.append('file', blob, 'e2e-test.pdf');

  const postRes = await fetch(URL + '/api/books', { method: 'POST', headers: { Cookie: cookieHeader }, body: form });
  const postData = await postRes.json().catch(() => ({}));
  console.log('books POST:', postRes.status, postData);
  if (!postRes.ok) throw new Error('Book upload failed');
  const key = postData?.book?.pdfUrl || '';

  // List books (requires admin)
  const listRes = await fetch(URL + '/api/books', { headers: { Cookie: cookieHeader } });
  const listData = await listRes.json().catch(() => ({}));
  console.log('books GET:', listRes.status, (listData?.books || []).length);

  // Fetch streaming route (public)
  if (key) {
    const streamRes = await fetch(key, { redirect: 'follow' });
    console.log('stream GET:', streamRes.status, streamRes.headers.get('content-type'));
    if (!streamRes.ok) throw new Error('Streaming failed');
  } else {
    console.warn('No pdfUrl key returned from POST');
  }
}

main().catch(err => { console.error('E2E-books error:', err?.message || err); process.exit(1); });
