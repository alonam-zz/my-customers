# easyCRM — Customer Service Management

A full-stack CRM / service-desk application for managing customers, service calls,
technicians and support agents. It ships with role-based access control,
account activation by email, a reporting dashboard, and full English/Hebrew (RTL)
localization.
 
## Features

- **Customers** — records, leads, priorities, and per-customer product ownership
- **Service calls** — open/track calls with line items, status, priority, and an
  automatic scoring job that ranks calls by urgency
- **Employees & roles** — role-based access control: `admin`, `manager`,
  `support`, `technician`, `sales`
- **Technicians & support agents** — availability, specialization, workload limits
- **Products & services** catalogs
- **Dashboard & reports** — summaries, high-priority calls, per-user and
  performance charts
- **Authentication** — JWT in an httpOnly cookie, login, change password,
  forgot-password, and email-based account activation / reactivation
- **Activity logs** — audit trail of changes
- **Internationalization** — English and Hebrew with right-to-left layout
- **Email** — transactional mail (activation links, notifications) via SMTP
- **Areas** — Israel area/sub-area reference data

## Tech stack

| Layer     | Technologies |
|-----------|--------------|
| Frontend  | React 19, Vite, React Router 7, Bootstrap 5 / react-bootstrap, Chart.js, react-hot-toast |
| Backend   | Node.js, Express 5, mysql2, bcrypt, jsonwebtoken, nodemailer, node-cron |
| Database  | MySQL 8.4 |
| Infra     | Docker & Docker Compose, Nginx (serves the built client) |

## Project structure

```
my-customers/
├── client/            # React + Vite single-page app
│   ├── src/           # components, pages, hooks, i18n, auth
│   ├── dockerfile     # builds the app and serves it with Nginx
│   └── nginx.conf
├── server/            # Express REST API
│   ├── controllers/   # request handlers
│   ├── models/        # SQL data access
│   ├── routes/        # route definitions
│   ├── middlewares/   # auth / role guards
│   ├── jobs/          # cron jobs (service-call scoring)
│   ├── scripts/       # maintenance/seed scripts
│   └── dockerfile
├── database/
│   ├── init/          # 01-scema.sql (schema), 02-admin.sql (seed admin)
│   ├── import_areas.sql
│   └── csv/           # reference data
├── docker-compose.yml
└── .env.example       # copy to .env and fill in
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ and npm
- A MySQL 8 server (or use Docker Compose, below)

### 1. Configure environment

```bash
cp .env.example .env
```

Then edit `.env` and set real values — at minimum `DB_*`, `JWT_SECRET`, and the
`SMTP_*` mail settings. Generate a strong JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> `.env` is gitignored and must never be committed.

### 2. Run with Docker Compose (recommended)

```bash
docker compose up --build
```

This starts three services:

| Service | URL / Port |
|---------|-----------|
| Client (Nginx) | http://localhost:5173 |
| API (Express)  | http://localhost:3000 |
| MySQL          | localhost:3307 |

### 3. Run locally (without Docker)

**Database** — create the schema and seed the first admin:

```bash
mysql -u root -p < database/init/01-scema.sql
mysql -u root -p < database/init/02-admin.sql
mysql -u root -p < database/import_areas.sql   # optional: Israel areas
```

**API**

```bash
cd server
npm install
npm run dev        # nodemon, or `npm start` for production
```

**Client**

```bash
cd client
npm install
npm run dev        # Vite dev server on http://localhost:5173
```

## First login

`database/init/02-admin.sql` seeds an admin employee (username `admin`) with no
password. Trigger the **forgot-password / activation** flow to set the initial
password: the API issues an activation token and emails an activation link
(requires working `SMTP_*` settings). Update the seeded admin's email to a real
address you control before running the flow.

## Environment variables

All variables are documented in [`.env.example`](./.env.example). Summary:

- **Server** — `PORT`, `NODE_ENV`, `JWT_SECRET`, `AUTH_COOKIE_NAME`,
  `CLIENT_ORIGIN`, `PUBLIC_BASE_URL`, `DOMAIN`
- **Database** — `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- **Email** — `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO`

## Scripts

Client (`client/`):

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the production bundle |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

Server (`server/`):

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the API with nodemon (auto-reload) |
| `npm start` | Start the API |
