import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listBooks, createBook, Book } from '../../../lib/books';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ books: listBooks() });
}

export async function POST(request: Request) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { title, authors, description, pdfUrl } = body as Partial<Book>;
  if (!title || !authors || !description) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }
  const created = createBook({ title, authors, description, pdfUrl });
  return NextResponse.json({ book: created }, { status: 201 });
}