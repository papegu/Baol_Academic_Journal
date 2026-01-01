import { getSupabaseAdmin } from './supabaseAdmin';

export async function uploadPdf(buffer: Buffer, userId: number, filename: string): Promise<string> {
  const cfEndpoint = process.env.CLOUDFLARE_UPLOAD_ENDPOINT || '';
  if (cfEndpoint) {
    const form = new FormData();
    const u8 = new Uint8Array(buffer);
    const blob = new Blob([u8], { type: 'application/pdf' });
    form.append('file', blob, filename);
    form.append('userId', String(userId));
    const res = await fetch(cfEndpoint, { method: 'POST', body: form });
    if (!res.ok) {
      try {
        const data = await res.json();
        throw new Error(data?.message || `Cloudflare upload failed (${res.status})`);
      } catch {
        const text = await res.text();
        throw new Error(text || `Cloudflare upload failed (${res.status})`);
      }
    }
    const json = await res.json().catch(() => ({}));
    const url = json?.url || json?.publicUrl || '';
    if (!url) throw new Error('Cloudflare upload succeeded but no URL returned');
    return url;
  }

  // Fallback to Supabase Storage (uses existing 'articles' bucket)
  const client = getSupabaseAdmin();
  const bucket = 'articles';
  const path = `${userId}/${filename}`;
  const uploadRes = await client.storage.from(bucket).upload(path, buffer, { contentType: 'application/pdf', upsert: false });
  if (uploadRes.error) {
    throw new Error(uploadRes.error.message);
  }
  const publicUrlResult = client.storage.from(bucket).getPublicUrl(path);
  const pdfUrl = publicUrlResult?.data?.publicUrl || '';
  return pdfUrl;
}
