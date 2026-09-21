# WorkLink — Railway Edition

This folder combines the WorkLink React frontend and the backend into **one Node/Express application**.

Firebase has been removed from the runtime. The app now uses:
- React + Vite for the frontend
- Express for the backend API
- a small JSON datastore at `server/data/db.json` for the prototype
- JWT sessions stored in the browser
- simulated phone verification (demo code `1234`)
- Railway-compatible production serving: Express serves the built React app

## Run locally

Requirements: Node 22+

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:8080/api/health

For a production-style local test:

```bash
npm run build
npm start
```

Then open http://localhost:8080.

## GitHub + Railway

1. Create a new GitHub repository.
2. Upload the contents of this project to the repository root.
3. Push to GitHub.
4. In Railway, create a new project and choose **Deploy from GitHub repo**.
5. Select the WorkLink repository.
6. Railway will use `railway.json` and run:
   - build: `npm run build`
   - start: `npm start`
7. Add a Railway environment variable:
   `JWT_SECRET` = a long random secret.
8. Deploy.
9. Open the generated Railway domain.

No Firebase project, Firebase CLI, Firebase config, Firestore, Storage or Cloud Functions are required.

## Important prototype note

The JSON datastore is intentionally simple so the project can run as one service without Firebase. Railway containers have ephemeral filesystems, so **data written to `server/data/db.json` can be lost when the service is rebuilt/redeployed**.

For a persistent production deployment, the next upgrade should be replacing the JSON datastore with Railway PostgreSQL. The API shape can stay the same.

## Authentication

Phone/SMS is simulated. Enter any valid-looking phone number and use:

`1234`

The first verification creates the account. Signing in again with the same number loads the same profile.

## Current API

- `POST /api/auth/request-code`
- `POST /api/auth/verify`
- `GET /api/me`
- `GET /api/categories`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs`
- `POST /api/jobs/:id/claim`
- `POST /api/jobs/:id/unclaim`
- `POST /api/jobs/:id/submit`
- `POST /api/jobs/:id/approve`
- `POST /api/jobs/:id/review`
- `GET /api/wallet`
- `POST /api/withdraw`
- `GET /api/profile`
- `PUT /api/profile`
- `PUT /api/settings`
- `POST /api/upload`

The original Firebase backend is not required for this version.
