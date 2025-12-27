export type Role = 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'VISITOR';

export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

let userSeq = 1;
const users: User[] = [
  { id: userSeq++, email: 'admin@senegal-livres.sn', name: 'Administrateur', role: 'ADMIN' },
  { id: userSeq++, email: 'editeur@senegal-livres.sn', name: 'Éditeur', role: 'EDITOR' },
];

export function listUsers() {
  return users.slice();
}

export function createUser(input: Omit<User, 'id'>) {
  const item: User = { id: userSeq++, ...input };
  users.push(item);
  return item;
}

export function updateUser(id: number, patch: Partial<Omit<User, 'id'>>) {
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch };
  return users[idx];
}

export function deleteUser(id: number) {
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
}export type User = {
  id: number;
  name: string;
  email: string;
  role: 'AUTHOR' | 'EDITOR' | 'ADMIN';
};

let userSeq = 3;
const users: User[] = [
  { id: 1, name: 'Admin', email: 'admin@bajp.org', role: 'ADMIN' },
  { id: 2, name: 'Éditeur', email: 'editeur@senegal-livres.sn', role: 'EDITOR' },
];

export function listUsers() {
  return users.slice();
}

export function createUser(input: Omit<User, 'id'>) {
  const item: User = { id: userSeq++, ...input };
  users.push(item);
  return item;
}

export function updateUser(id: number, patch: Partial<Omit<User, 'id'>>) {
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch };
  return users[idx];
}

export function deleteUser(id: number) {
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
}