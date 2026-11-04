# EstateHub: Multi-Tenant Real Estate SaaS

One-sentence summary: a platform where real estate agencies each get a private workspace,
and buyers browse every listing in one marketplace.

**Live demo:** <your Vercel link>  |  **API health:** <your Render link>/api/health

## Table of contents
(optional list of the headings below)

## Features
- Roles: super admin, agency admin, agent, customer
- Private agency workspaces (multi-tenancy with `tenantId`)
- Property listings with search, filters and pagination
- Inquiries with live notifications (Socket.IO) and email
- Agency public pages, team management, platform console

## Tech stack
| Layer | Technology |
|---|---|
| Frontend | React, Vite, Redux Toolkit, React Router, Tailwind CSS |
| Backend | Node.js, Express, Mongoose, Zod, JWT |
| Database | MongoDB (Atlas) |
| Realtime and email | Socket.IO, Nodemailer |
| DevOps | Docker, Nginx, GitHub Actions, Render, Vercel |

## Architecture
(Short explanation: shared database, `tenantId` on every record, taken from the token and
never from the request body. Add a simple diagram: Browser, React, Express API, MongoDB,
plus Socket.IO beside the API.)

## Roles and permissions
(A table: which role can do what.)

## Getting started
1. Clone, then `cd backend && npm install` and `cd ../frontend && npm install`
2. Copy `backend/.env.example` to `backend/.env` and fill it in
3. `npm run seed:demo` in `backend`
4. `npm run dev` in both folders
(Include the demo accounts and the shared password.)

## Run with Docker
`docker compose up --build`, then the website is at http://localhost:3000

## Environment variables
(A table copied from `backend/.env.example`, with the meaning of each.)

## Security
- Passwords hashed with bcrypt, never returned by the API
- JWT authentication, role checks on every protected route
- Zod validation on every input, strict schemas reject unknown fields
- Rate limiting, Helmet headers, CORS allow-list
- Tenant isolation on queries and on socket rooms

## Testing
`cd backend && npm test` runs 33 tests with no database needed.
`cd frontend && npm run lint && npm run build`

## CI/CD and deployment
(CI on every push. See docs/DEPLOYMENT.md.)

## Troubleshooting
(Atlas IP access list error, CORS error, port already in use.)