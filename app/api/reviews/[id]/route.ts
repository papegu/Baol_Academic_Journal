import { NextRequest, NextResponse } from 'next/server';
import { getReviewNote, setReviewNote } from '../../../../backend/reviews';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ message: 'ID invalide' }, { status: 400 });
  const note = getReviewNote(id);
  return NextResponse.json({ note });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ message: 'ID invalide' }, { status: 400 });
  const { note } = await req.json();
  const saved = setReviewNote(id, String(note || ''));
  return NextResponse.json({ note: saved }, { status: 201 });
}
