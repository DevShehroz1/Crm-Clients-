# Client CRM

A client-facing CRM similar to ClickUp: manage clients, assign tasks, add comments and voice notes, and track progress.

## Features

### Main Dashboard (You)
- **Clients list** – View all your clients
- **Add client** – Create new clients with name, email, company
- **Remove client** – Delete clients and their tasks
- **Copy link** – Share the unique portal link with each client
- **Manage tasks** – Update task status (To Do → In Progress → In Review → Done)

### Client Portal (Your clients)
- **View tasks** – See assigned tasks and progress
- **Add tasks** – Assign new tasks to you
- **Add comments** – Add messages on tasks (like ClickUp)
- **Voice notes** – Record and attach voice notes to tasks
- **Progress tracking** – See completion status

## Quick Start

### Local development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up database**
   - `.env` already contains `DATABASE_URL="file:./dev.db"` for SQLite
   - Run `npx prisma db push` if the database isn’t created yet

3. **Run dev server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

### Deploy on Vercel

1. **Database**
   - SQLite is not supported on Vercel serverless.
   - Use [Vercel Postgres](https://vercel.com/storage/postgres) or [Neon](https://neon.tech) and create a PostgreSQL database.

2. **Update Prisma schema** for PostgreSQL:
   - In `prisma/schema.prisma`, change:
     - `provider = "sqlite"` → `provider = "postgresql"`
   - Point `DATABASE_URL` to your Postgres connection string.

3. **Vercel**
   - Connect your repo in [Vercel](https://vercel.com)
   - Add `DATABASE_URL` in project settings (from Vercel Postgres or Neon)
   - Deploy.

4. **Client link**
   - After deploy, use `https://your-app.vercel.app/client/[slug]` as the client portal link.

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Prisma + SQLite (local) / PostgreSQL (Vercel)
- **UI:** Tailwind CSS, Radix UI, Lucide icons
- **Hosting:** Vercel
