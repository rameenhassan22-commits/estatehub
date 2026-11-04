# Demo day: 8-minute script

**Goal:** show a working multi-tenant SaaS, explain why it is built that way, and show engineering maturity.

## Setup (30 minutes before)
- [ ] Wake the Render API (open /api/health), run the smoke-test checklist in docs/DEPLOYMENT.md
- [ ] Browser window A: Prime Estate admin. Private window B: customer. Window C: Lahore Homes admin
- [ ] Demo data present; tabs pre-opened; zoom 110%; notifications off
- [ ] Backup: a screen recording of the full flow, and `docker compose up` ready locally

## Timeline
| Min | Section | Show | Say |
|---|---|---|---|
| 0:00 | Problem | Home page | "Agencies need private workspaces; buyers want one marketplace." |
| 0:45 | Architecture | README diagram | Shared DB + tenantId, JWT, role checks, REST + Socket.IO, and the trade-off |
| 1:45 | Customer journey | Search, filter, detail, register (show validation), send inquiry | Forms validated by Zod; server errors land in the right field |
| 3:00 | Real-time | Admin window gets toast and badge; change status, customer gets a toast | Socket.IO rooms keep tenants separate |
| 4:00 | Multi-tenancy proof | Log in as Lahore Homes: none of Prime's data; open a Prime edit URL: not found | tenantId always comes from the token |
| 4:45 | Roles | Agent cannot delete or open Team; admin can; super admin suspends an agency | Checks on the API are the real ones, the UI only mirrors them |
| 5:45 | Production readiness | Logs with request ids, /api/health/ready, 429 on bad logins, graceful shutdown log | Observability and 12-Factor |
| 6:45 | DevOps | GitHub Actions green, Dockerfile, compose | CI on every push, reproducible containers |
| 7:30 | Lessons and next steps | | Image uploads, Google login, Redis for rate limits, httpOnly cookies, e2e tests |

## Likely questions
1. **Why a shared database?** Cheaper and simpler to run. Isolation relies on a mandatory tenantId filter. Separate databases isolate more strongly but cost more.
2. **How do you stop one agency reading another's data?** tenantId comes from the logged-in user, queries filter on it, strict schemas reject a client-supplied tenantId, and sockets use per-tenant rooms.
3. **How are passwords stored?** bcrypt with a salt. The hash is never sent to the client.
4. **What stops brute force?** Rate limiting on login, a generic error message, and bcrypt's cost.
5. **Why validate on both sides?** The client for fast feedback, the server for security, because a browser can be bypassed.
6. **What happens on deploy while users are connected?** The server stops taking new traffic, finishes current requests, closes sockets and the database, then exits.
7. **Is a JWT in localStorage safe?** An XSS bug could read it. Mitigations: escaping and Helmet. Next step: an httpOnly cookie.
8. **What would you improve?** Image uploads, Redis for rate limits, end-to-end tests, an audit log.
9. **What did you test?** 33 backend tests, lint and build in CI, and a manual role matrix.

## If something breaks live
- API asleep: refresh after 30 seconds and mention that free hosting has cold starts
- No internet: play the recording, or run docker compose locally
- Never debug in front of the panel for more than 20 seconds. Switch to the backup.