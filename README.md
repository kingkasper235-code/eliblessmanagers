# Elibless Managers

A premium real estate website for Nigerian buyers, renters, landlords, and investors.

## Stack
- Next.js
- TypeScript
- Tailwind CSS
- Supabase-ready architecture

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the site.

## Production build

```bash
npm install
npm run build
npm run start
```

## GitHub deployment readiness

This project is structured for a GitHub repository and keeps all private configuration out of version control.

1. Create a repository on GitHub.
2. Push the project branch.
3. Add your Supabase environment variables in the deployment platform or local `.env.local` file.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repository-url>
git push -u origin main
```

Important: GitHub Pages is best suited for the public frontend only. The admin panel requires a server-capable runtime for authenticated Supabase sessions and protected admin routes. For production admin work, deploy with a Node-compatible platform such as Vercel or a private server.

## Supabase setup

Copy `.env.example` to `.env.local` and add your real project credentials:

```bash
cp .env.example .env.local
```

Then fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Do not commit `.env.local`, `.env.production`, or any file containing a Supabase service-role key. The app intentionally uses only the public Supabase URL and anon key in the browser. All writes are protected by Supabase RLS and admin pages require authenticated admin access.
