import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listPaidTransactions } from '../../../lib/transactions';
import { getPrisma } from '../../../lib/prisma';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (process.env.DEMO_AUTH === 'true') return NextResponse.json({ payments: listPaidTransactions() });
  const payments = await getPrisma().payment.findMany({ include: { tx: true } });
  return NextResponse.json({ payments });
}