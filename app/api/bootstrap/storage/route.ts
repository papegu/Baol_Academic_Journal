import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const setupToken = process.env.SETUP_TOKEN || '';
  const headerToken = req.headers.get('x-setup-token') || '';
  if (!setupToken || headerToken !== setupToken) {
    return NextResponse.json({ message: 'Unauthorized setup' }, { status: 401 });
  }

  try {
    const client = getSupabaseAdmin();
    const { data: buckets, error: listErr } = await client.storage.listBuckets();
    if (listErr) {
      return NextResponse.json({ message: listErr.message }, { status: 500 });
    }
    const exists = (buckets || []).some(b => b.name === 'articles');
    if (!exists) {
      const { error: createErr } = await client.storage.createBucket('articles', { public: true });
      if (createErr) {
        return NextResponse.json({ message: createErr.message }, { status: 500 });
      }
      return NextResponse.json({ created: true, bucket: 'articles' }, { status: 201 });
    }
    return NextResponse.json({ created: false, bucket: 'articles' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
