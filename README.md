# AI Support Ticket Classifier

A human-in-the-loop support ticket triage system. Submit tickets, get AI classification, review with ground truth, and track evaluation metrics.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM

## Prerequisites

- Node.js 18+
- PostgreSQL (local or cloud)
- (Step 2+) OpenAI API key

## Setup

### 1. Clone and install

```bash
cd "AI Support Ticket Classifier"
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example server/.env
```

Edit `server/.env` and set:

- `DATABASE_URL` – PostgreSQL connection string, e.g.  
  `postgresql://user:password@localhost:5432/ai_support_triage`

### 3. Create database and run migrations

Ensure PostgreSQL is running. Create a database (e.g. `ai_support_triage`) and set `DATABASE_URL` in `server/.env`:

```
postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ai_support_triage
```

Then run:

```bash
cd server
npx prisma migrate dev
```

### 4. Start the app

**Terminal 1 – backend:**
```bash
cd server
npm run dev
```

**Terminal 2 – frontend:**
```bash
cd client
npm run dev
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:3001

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| server | `npm run dev` | Start Express with nodemon |
| server | `npm run start` | Start Express (prod) |
| server | `npx prisma migrate dev` | Run migrations |
| client | `npm run dev` | Start Vite dev server |
| client | `npm run build` | Build for production |

## API Routes (Step 1)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/tickets | List all tickets |
| GET | /api/tickets/:id | Get single ticket |
| POST | /api/tickets | Create ticket (body: subject, description, customerEmail?) |

## Project Structure

```
├── client/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
├── server/          # Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma
│   ├── routes/
│   ├── index.js
│   └── package.json
├── .env.example
└── README.md
```
