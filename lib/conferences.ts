export type Conference = {
  id: number;
  name: string;
  location?: string;
  date?: string; // ISO
  description?: string;
};

let confSeq = 1;
const conferences: Conference[] = [];

export function listConferences() {
  return conferences.slice();
}
export function createConference(input: Omit<Conference, 'id'>) {
  const item: Conference = { id: confSeq++, ...input };
  conferences.push(item);
  return item;
}
export function updateConference(id: number, patch: Partial<Omit<Conference, 'id'>>) {
  const idx = conferences.findIndex(c => c.id === id);
  if (idx === -1) return null;
  conferences[idx] = { ...conferences[idx], ...patch };
  return conferences[idx];
}
export function deleteConference(id: number) {
  const idx = conferences.findIndex(c => c.id === id);
  if (idx === -1) return false;
  conferences.splice(idx, 1);
  return true;
}