export type TransactionStatus = 'PENDING' | 'PAID' | 'FAILED';

export type Transaction = {
  id: number;
  reference: string;
  amount: number;
  status: TransactionStatus;
  date: string; // ISO string
};

let txSeq = 1;
const transactions: Transaction[] = [];

export function listTransactions() {
  return transactions.slice();
}

export function listPaidTransactions() {
  return transactions.filter(t => t.status === 'PAID');
}

export function createTransaction(input: Omit<Transaction, 'id'>) {
  const item: Transaction = { id: txSeq++, ...input };
  transactions.push(item);
  return item;
}

export function updateTransaction(id: number, patch: Partial<Omit<Transaction, 'id'>>) {
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;
  transactions[idx] = { ...transactions[idx], ...patch };
  return transactions[idx];
}

export function deleteTransaction(id: number) {
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return false;
  transactions.splice(idx, 1);
  return true;
}