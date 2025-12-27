import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listTransactions, createTransaction, Transaction } from '../../../lib/transactions';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ transactions: listTransactions() });
}

export async function POST(request: Request) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { reference, amount, status, date } = body as Partial<Transaction>;
  if (!reference || !amount || !status || !date) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }
  const created = createTransaction({ reference, amount, status, date });
  return NextResponse.json({ transaction: created }, { status: 201 });
}