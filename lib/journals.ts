export type Journal = {
  id: number;
  name: string;
  issn?: string;
  url?: string;
  domain?: string;
};

let journalSeq = 1;
const journals: Journal[] = [];

export function listJournals() {
  return journals.slice();
}
export function createJournal(input: Omit<Journal, 'id'>) {
  const item: Journal = { id: journalSeq++, ...input };
  journals.push(item);
  return item;
}
export function updateJournal(id: number, patch: Partial<Omit<Journal, 'id'>>) {
  const idx = journals.findIndex(j => j.id === id);
  if (idx === -1) return null;
  journals[idx] = { ...journals[idx], ...patch };
  return journals[idx];
}
export function deleteJournal(id: number) {
  const idx = journals.findIndex(j => j.id === id);
  if (idx === -1) return false;
  journals.splice(idx, 1);
  return true;
}