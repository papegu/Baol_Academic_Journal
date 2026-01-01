const URL = process.env.URL || 'https://baol-academic-journal.vercel.app';

function makeMinimalPdfBytes() {
  const pdf = `%PDF-1.1\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 72 72 Td (Hello, Book Paytech!) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000061 00000 n \n0000000127 00000 n \n0000000221 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n316\n%%EOF`;
  const enc = new TextEncoder();
  return enc.encode(pdf);
}

async function loginAdmin() {
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

async function main() {
  const adminCookie = await loginAdmin();

  // 1) Upload a book via multipart
  const form = new FormData();
  form.append('title', 'Smoke Test Book');
  form.append('authors', 'Admin');
  form.append('description', 'Smoke test for Paytech guarded reading');
  const pdf = makeMinimalPdfBytes();
  const blob = new Blob([pdf], { type: 'application/pdf' });
  form.append('file', blob, 'smoke-book.pdf');

  const postRes = await fetch(URL + '/api/books', { method: 'POST', headers: { Cookie: adminCookie }, body: form });
  const postData = await postRes.json().catch(() => ({}));
  console.log('books POST:', postRes.status, postData);
  if (!postRes.ok) throw new Error('Book upload failed');
  const key = postData?.book?.pdfUrl || '';

  // 2) Initiate Paytech to get a ref
  const initRes = await fetch(URL + '/api/paytech/initiate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: 1000 })
  });
  const initData = await initRes.json().catch(() => ({}));
  console.log('paytech initiate:', initRes.status, initData);
  const ref = initData?.ref || '';
  if (!ref) throw new Error('No ref from paytech initiate');

  // 3) Simulate callback to mark transaction as PAID
  const cbUrl = URL + '/api/paytech/callback?status=paid&ref=' + encodeURIComponent(ref) + '&amount=1000&currency=XOF';
  const cbRes = await fetch(cbUrl);
  const cbData = await cbRes.json().catch(() => ({}));
  console.log('paytech callback:', cbRes.status, cbData);
  if (!cbRes.ok) throw new Error('Callback failed');

  // 4) Try to read the book without admin, providing ref
  const streamRes = await fetch(URL + '/api/books/pdf?key=' + encodeURIComponent(key) + '&ref=' + encodeURIComponent(ref), { redirect: 'follow' });
  console.log('books stream GET:', streamRes.status, streamRes.headers.get('content-type'));
  if (!(streamRes.status >= 200 && streamRes.status < 400)) throw new Error('Guarded streaming failed');
}

main().catch(err => { console.error('Smoke-books-paytech error:', err?.message || err); process.exit(1); });
