import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listPaidTransactions } from '../../../lib/transactions';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ payments: listPaidTransactions() });
}