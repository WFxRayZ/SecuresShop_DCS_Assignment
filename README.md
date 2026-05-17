# SecureShop

> Simple e-commerce management app (boilerplate)

## Structure

- `client/` — React frontend
- `server/` — Express backend
- `sql/` — schema and seed scripts

## Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install server deps: `cd server && npm install`
3. Seed sample data and the admin account: `npm run seed` (from `server`)
4. Start server: `npm run dev` (from `server`)
5. Install client deps: `cd ../client && npm install`
6. Start client: `npm start`

Default seeded admin login:

- Email: `admin@example.com`
- Password: `Admin123!`
