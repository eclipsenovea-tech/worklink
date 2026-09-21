# WorkLink — Railway + PostgreSQL

WorkLink is now backed by a real PostgreSQL database instead of a JSON file.

## Stack

- React + Vite frontend
- Express API
- PostgreSQL via `pg`
- `dotenv` for local `.env` configuration
- JWT sessions
- Railway-compatible single-service deployment

## Local setup

1. Install Node 22+.
2. Create a PostgreSQL database named `worklink`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL`.
4. Install dependencies:

```bash
npm install
```

5. Run the app:

```bash
npm run dev
```

Or test the production build:

```bash
npm run build
npm start
```

The server automatically creates the required PostgreSQL tables and inserts the demo data on the first run.

## Railway setup

1. Push this project to GitHub.
2. In Railway, create a new project.
3. Add a **PostgreSQL** service to the project.
4. Add the WorkLink GitHub repository as the application service.
5. In the WorkLink service's **Variables**, add:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<a-long-random-secret>
NODE_ENV=production
DEMO_CODE=1234
```

If your PostgreSQL service has a different Railway service name, use that service name in the variable reference.

Railway should use `railway.json` automatically:

- Build: `npm run build`
- Start: `npm start`
- Health check: `/api/health`

You do **not** need to put the production database password directly in your code or commit a production `.env` file. Railway injects the database connection string as an environment variable.

## Database

The server creates these tables automatically:

- `users`
- `jobs`
- `transactions`
- `withdrawals`
- `verification_codes`

The database is persistent across Railway deploys/restarts because the data lives in PostgreSQL rather than the container filesystem.

## Authentication

Phone/SMS is still simulated in this build. Use:

`1234`

For production SMS verification, connect the `/api/auth/request-code` flow to an SMS provider later.

## Important

- `.env` is ignored by Git.
- `.env.example` is safe to commit.
- Uploaded files are still stored on the service filesystem. Railway's filesystem is ephemeral, so production user uploads should eventually move to object storage such as S3/Cloudflare R2/Supabase Storage.
