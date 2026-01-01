import { getEditorPassword } from './demoAuthState';
import { getPrisma } from './prisma';
import crypto from 'crypto';

function hashPassword(pw: string) {
  return crypto.createHash('sha256').update(pw, 'utf8').digest('hex');
}

export async function signIn(email: string, password: string) {
  // Demo fallback: allow env-based credentials when Supabase is not configured
  if (process.env.DEMO_AUTH === 'true') {
    const adminEmail = process.env.ADMIN_EMAIL || '';
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    const authorEmail = process.env.AUTHOR_EMAIL || '';
    const authorPassword = process.env.AUTHOR_PASSWORD || '';
    // Dedicated editor credentials as requested
    const editorEmail = process.env.EDITOR_EMAIL || 'editeur@senegal-livres.sn';
    const editorPasswordEnv = process.env.EDITOR_PASSWORD || 'admin@#$%';
    const editorPassword = getEditorPassword() || editorPasswordEnv;

    if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
      return {
        user: { email: adminEmail, user_metadata: { name: 'Admin', role: 'ADMIN' } } as any,
        role: 'ADMIN',
        access_token: 'demo-admin-token'
      };
    }
    if (authorEmail && authorPassword && email === authorEmail && password === authorPassword) {
      return {
        user: { email: authorEmail, user_metadata: { name: 'Author', role: 'AUTHOR' } } as any,
        role: 'AUTHOR',
        access_token: 'demo-author-token'
      };
    }
    if (email === editorEmail && password === editorPassword) {
      return {
        user: { email: editorEmail, user_metadata: { name: 'Editeur', role: 'EDITOR' } } as any,
        role: 'EDITOR',
        access_token: 'demo-editor-token'
      };
    }
    throw new Error('Identifiants invalides');
  }
  // Production path: authenticate against Prisma `User` table (DB-based auth)
  const prisma = getPrisma();
  const dbUser = await prisma.user.findUnique({ where: { email } });
  if (!dbUser) {
    throw new Error('Email inconnu: aucun utilisateur avec cette adresse.');
  }
  const hashed = hashPassword(password);
  if (!dbUser.password || dbUser.password !== hashed) {
    throw new Error('Mot de passe invalide pour cet utilisateur.');
  }
  const role = dbUser.role as any;
  return {
    user: { email: dbUser.email, user_metadata: { name: dbUser.name, role } } as any,
    role,
    access_token: 'db-auth-token',
  };
}

export async function signUp(name: string, email: string, password: string) {
  // Demo fallback: simulate a successful signup
  if (process.env.DEMO_AUTH === 'true') {
    return { user: { email, user_metadata: { name } } as any };
  }
  // Production path: create Prisma `User` with hashed password (DB-based auth)
  const prisma = getPrisma();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Un utilisateur avec cet email existe déjà.');
  }
  const hashed = hashPassword(password);
  const dbUser = await prisma.user.create({
    data: { email, name, role: 'AUTHOR' as any, password: hashed },
  });
  return { user: { email, user_metadata: { name, role: 'AUTHOR' } } as any, dbUser };
}