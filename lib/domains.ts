export type Domain = {
  id: number;
  name: string;
};

let domainSeq = 1;
const domains: Domain[] = [];

export function listDomains() {
  return domains.slice();
}
export function createDomain(input: Omit<Domain, 'id'>) {
  const item: Domain = { id: domainSeq++, ...input };
  domains.push(item);
  return item;
}
export function updateDomain(id: number, patch: Partial<Omit<Domain, 'id'>>) {
  const idx = domains.findIndex(d => d.id === id);
  if (idx === -1) return null;
  domains[idx] = { ...domains[idx], ...patch };
  return domains[idx];
}
export function deleteDomain(id: number) {
  const idx = domains.findIndex(d => d.id === id);
  if (idx === -1) return false;
  domains.splice(idx, 1);
  return true;
}