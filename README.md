# Danish Restaurant — Full-Stack PERN Website

Modern luxury restaurant website with a React frontend, Express backend API, PostgreSQL database, reservations, online ordering, and admin dashboard.

## Tech Stack

- **Frontend:** React + Vite + React Router
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Auth:** JWT-based admin authentication

## Project Structure

- `/client` — React web app (public pages + admin UI)
- `/server` — Express API + DB schema/seed scripts

## Features

### Public Website
- Home page with hero, highlights, testimonials, and CTAs
- About page
- Menu page (from API)
- Reservations page (submits booking to API)
- Online Orders page (menu selection + checkout form)
- Contact page (location, hours, phone, email, map placeholder)

### Backend API
- `GET /api/menu`
- `POST /api/reservations`
- `POST /api/orders`
- `POST /api/admin/login`
- `GET /api/admin/stats`
- `GET /api/admin/menu`, `POST /api/admin/menu`, `PUT /api/admin/menu/:id`, `DELETE /api/admin/menu/:id`
- `GET /api/admin/reservations`, `PATCH /api/admin/reservations/:id/status`
- `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`

### Admin Dashboard
- Secure admin login
- Dashboard overview counts
- Menu CRUD management
- Reservation status updates
- Order status updates

## Setup

### 1) Install dependencies

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2) Start PostgreSQL (Docker)

```bash
docker compose up -d
```

This starts a local PostgreSQL database on `localhost:5432`.

### 3) Configure environment variables

Create server env file:

```bash
cp /home/runner/work/danish-restaurant-site/danish-restaurant-site/server/.env.example /home/runner/work/danish-restaurant-site/danish-restaurant-site/server/.env
```

Create client env file:

```bash
cp /home/runner/work/danish-restaurant-site/danish-restaurant-site/client/.env.example /home/runner/work/danish-restaurant-site/danish-restaurant-site/client/.env
```

Update `/home/runner/work/danish-restaurant-site/danish-restaurant-site/server/.env` with your PostgreSQL connection string, JWT secret, and optional admin credentials.

For local Docker setup, use:

```env
DATABASE_URL=postgres://<username>:<password>@localhost:5432/danish_restaurant
```

### 4) Initialize database schema + seed data

```bash
npm run seed
```

This creates tables and seeds sample menu items + admin user.

### 5) Run in development

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

### 6) Stop PostgreSQL (when done)

```bash
docker compose down
```

## Build

```bash
npm run build
```

## Default Admin Credentials

Configured via environment variables:

- `ADMIN_EMAIL` (default: `admin@danishrestaurant.com`)
- `ADMIN_PASSWORD` (default: `Admin123!`)

Change these in production.
