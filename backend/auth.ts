export interface User {
  id: number;
  name: string;
  email: string;
  role: 'AUTHOR' | 'ADMIN';
}

let users: User[] = [
  { id: 1, name: 'Admin', email: 'admin@example.com', role: 'ADMIN' }
];

export async function register(name: string, email: string, password: string): Promise<{ ok: boolean; message?: string; user?: User }> {
  if (users.find(u => u.email === email)) return { ok: false, message: 'Email déjà utilisé' };
  const id = Math.max(0, ...users.map(u => u.id)) + 1;
  const user: User = { id, name, email, role: 'AUTHOR' };
  users.push(user);
  return { ok: true, user };
}

export async function login(email: string, password: string): Promise<{ ok: boolean; message?: string; token?: string; user?: User }> {
  const user = users.find(u => u.email === email);
  if (!user) return { ok: false, message: 'Utilisateur introuvable' };
  const token = 'mock-token';
  return { ok: true, token, user };
}
export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: 'AUTHOR' | 'ADMIN';
};

// In-memory mock users
const users: User[] = [];
let userSeq = 1;

export async function register(name: string, email: string, password: string) {
  // WARNING: mock only. No real security. Replace with Prisma + hashing.
  if (users.find(u => u.email === email)) {
    return { ok: false, message: 'Email déjà utilisé' } as const;
  }
  const user: User = {
    id: userSeq++,
    name,
    email,
    passwordHash: `plain:${password}`,
    role: 'AUTHOR',
  };
  users.push(user);
  return { ok: true, user } as const;
}

export async function login(email: string, password: string) {
  const u = users.find(u => u.email === email && u.passwordHash === `plain:${password}`);
  if (!u) return { ok: false, message: 'Identifiants invalides' } as const;
  // Return a very simple mock session token
  return { ok: true, token: `mock-token-${u.id}`, user: u } as const;
}
