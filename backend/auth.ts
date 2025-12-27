export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'AUTHOR' | 'ADMIN';
  createdAt: Date;
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
    password: password,
    role: 'AUTHOR',
    createdAt: new Date(),
  };
  users.push(user);
  return { ok: true, user } as const;
}

export async function login(email: string, password: string) {
  const u = users.find(u => u.email === email && u.password === password);
  if (!u) return { ok: false, message: 'Identifiants invalides' } as const;
  // Return a very simple mock session token
  return { ok: true, token: `mock-token-${u.id}`, user: u } as const;
}
