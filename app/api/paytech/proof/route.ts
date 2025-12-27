import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ message: 'Unsupported content type' }, { status: 400 });
  }
  const formData = await req.formData();
  const transactionId = formData.get('transactionId');
  const payerEmail = formData.get('payerEmail');
  const amount = formData.get('amount');
  const description = formData.get('description');
  const notes = formData.get('notes');
  const proof = formData.get('proof');

  if (!transactionId || !payerEmail || !amount || !proof) {
    return NextResponse.json({ message: 'Champs requis manquants' }, { status: 400 });
  }

  // TODO: Persist proof (e.g., Supabase Storage) and create a record in DB.
  // For now, just acknowledge receipt.
  return NextResponse.json({
    ok: true,
    received: {
      transactionId,
      payerEmail,
      amount,
      description,
      notes,
      proofType: (proof as File).type,
      proofName: (proof as File).name,
      proofSize: (proof as File).size,
    },
  });
}
