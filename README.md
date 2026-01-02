# Baol Academic Journal Platform

<!-- chore: trigger redeploy 2026-01-02T09:25Z -->
Fullstack Next.js 14 application for managing submissions, editorial review, payment, and publication.

Frontend
- App Router under `app/` with pages: home, domains, articles, submit, login, register, admin/editor dashboards, settings, about, guidelines.
- Tailwind CSS palette in [tailwind.config.ts](tailwind.config.ts) for academic green/blue/gray.
- Shared components: [Header](components/Header.tsx), [Footer](components/Footer.tsx), [Sidebar](components/Sidebar.tsx), [DomainsSection](components/DomainsSection.tsx), [StatCard](components/StatCard.tsx), [ArticleList](components/ArticleList.tsx), [PaymentButton](components/PaymentButton.tsx).

Backend
- Route handlers under `app/api/*` using service modules in `backend/*`.
- Articles service: [backend/articles.ts](backend/articles.ts) (list, getById, submit, updateStatus — mock).
- Reviews service: [backend/reviews.ts](backend/reviews.ts) for editor notes (mock).
- Auth: Supabase via [lib/supabaseClient.ts](lib/supabaseClient.ts) and [lib/supabaseAdmin.ts](lib/supabaseAdmin.ts).
- PayTech (stub): initiation and callback endpoints.

Environment
- Configure `.env.local`:
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
	- `SUPABASE_SERVICE_ROLE_KEY`
	- `SETUP_TOKEN`
	- `DATABASE_URL` (optional for Prisma)

Getting Started
```powershell
npm install
npm run dev
```
Open http://localhost:3000.

Bootstrap Admin (one-time)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/bootstrap/admin" -Method POST `
	-Headers @{ "x-setup-token" = "YOUR_SETUP_TOKEN"; "Content-Type" = "application/json" } `
	-Body '{"email":"admin@bajp.org","password":"admin@#$%"}'
```

Notes
- Supabase keys required for auth endpoints.
- Mock services will be replaced with Prisma-backed persistence.

Development
- TypeScript: with `moduleResolution` set to `bundler`, explicit type packages are included via `types` in [tsconfig.json](tsconfig.json). This project sets `types: ["node", "nodemailer"]` to resolve `nodemailer` typings. Ensure `@types/nodemailer` is installed (present in dependencies).

Supabase (Production)
- Configurez les variables sur Vercel (Production): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, `SETUP_TOKEN`.
- Ne commitez pas de secrets dans `.env.production` pour la production; préférez le panneau Vercel.
- Créez l’admin (une seule fois) via `POST /api/bootstrap/admin` avec l’en-tête `x-setup-token`.
- La connexion utilise Supabase Auth; le rôle Prisma est aligné sur `user_metadata.role` lors de la première connexion.
