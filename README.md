# Learning Tracker

A PERN-stack daily learning log. Log in, write what you learned today
(topic + notes + screenshots), and browse everything as date-wise cards.

## Features
- Register / login with JWT authentication
- Add, edit, delete, and search learning entries
- Upload up to 5 images per entry (private storage, short-lived signed URLs)
- Every user sees only their own entries
- Mobile-friendly UI

## Tech stack
- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL (Neon)
- Image storage: Neon Object Storage (S3-compatible)

## Run locally
1. `cd backend && npm install`
2. Copy `backend/.env.example` to `backend/.env` and fill in the values
3. Run the SQL files in `backend/migrations/` in order
4. `npm run dev` (API on http://localhost:8000)
5. In another terminal: `cd frontend && npm install`
6. Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000`
7. `npm run dev` (app on http://localhost:3000)