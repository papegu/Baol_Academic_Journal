import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listTransactions, createTransaction, Transaction } from '../../../lib/transactions';
import { prisma } from '../../../lib/prisma';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (process.env.DEMO_AUTH === 'true') return NextResponse.json({ transactions: listTransactions() });
  const transactions = await prisma.transaction.findMany();
  return NextResponse.json({ transactions });
}

export async function POST(request: Request) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { reference, amount, status, date } = body as Partial<Transaction>;
  if (!reference || amount == null || !status) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }
  if (process.env.DEMO_AUTH === 'true') {
    const created = createTransaction({ reference, amount, status, date: date || new Date().toISOString() });
    return NextResponse.json({ transaction: created }, { status: 201 });
  }
  const transaction = await prisma.transaction.create({ data: { reference, amount, status: status as any, date: date ? new Date(date) : undefined } });
  return NextResponse.json({ transaction }, { status: 201 });
}