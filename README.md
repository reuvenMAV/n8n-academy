# N8N Academy

Interactive learning platform for N8N workflows: courses, canvas-based lessons, flashcards, and an AI tutor.

## Setup (local)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd n8n-academy
npm install
```

### 2. Environment variables

Copy the example env file and fill in values (see [Environment variables](#environment-variables) below):

```bash
cp .env.example .env.local
# Edit .env.local with your values (see "Environment variables" below)
```

### 3. Database (Prisma + PostgreSQL)

Ensure PostgreSQL is running (local or Docker). Then:

```bash
# Apply migrations
npx prisma migrate deploy

# Seed courses, lessons, badges, and flashcards
npm run db:seed
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up or log in (credentials or Google if configured).

---

## Environment variables

All variables used by the app are documented in `.env.local` with comments. Summary:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Prisma) |
| `DIRECT_URL` | Yes | Direct PostgreSQL URL for migrations |
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth (e.g. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | App URL (e.g. `http://localhost:3000` or production URL) |
| `OPENAI_API_KEY` | For AI tutor | OpenAI API key for `/api/ai/tutor` streaming |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth |
| `N8N_BASE_URL` | Optional | N8N instance URL |
| `N8N_API_KEY` | Optional | N8N API key |

---

## Deploy to Vercel + Supabase

### Supabase (database)

1. Create a project at [supabase.com](https://supabase.com).
2. In **Settings → Database** copy the **Connection string** (URI). Use the **Transaction** (pooled) one for `DATABASE_URL` and the **Session** (direct) one for `DIRECT_URL` if you use connection pooling; otherwise use the same URI for both with the correct parameters.
3. Run migrations against the Supabase DB (from your machine or CI):
   ```bash
   DATABASE_URL="postgresql://..." DIRECT_URL="postgresql://..." npx prisma migrate deploy
   ```
4. Optionally seed:
   ```bash
   DATABASE_URL="postgresql://..." DIRECT_URL="postgresql://..." npm run db:seed
   ```

### Vercel (app)

1. Push your code to GitHub (or connect another Git provider).
2. In [vercel.com](https://vercel.com), **Add New Project** and import the repo.
3. **Framework Preset**: Next.js (auto-detected).
4. **Environment variables**: Add the same variables as in `.env.local`:
   - `DATABASE_URL` – Supabase connection string
   - `DIRECT_URL` – Supabase direct connection string
   - `NEXTAUTH_SECRET` – generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` – your Vercel URL, e.g. `https://your-app.vercel.app`
   - `OPENAI_API_KEY` (if you use the AI tutor)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (if you use Google sign-in)
5. Deploy. Vercel runs `npm run build` and deploys the output.

After the first deploy, run `prisma migrate deploy` (and optionally `db:seed`) against the production `DATABASE_URL` if you haven’t already, so the Supabase schema and seed data are in place.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema without migrations |
| `npm run db:seed` | Seed database (courses, lessons, badges, flashcards) |
| `npm test` | Run Jest tests |
