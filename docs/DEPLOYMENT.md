# Deployment guide: Atlas + Render (API) + Vercel (web)

Order matters: **database, then API, then website, then connect them**. Budget about 45 minutes the first time.

## 0. Before you start
- [ ] Code is on GitHub and `main` is green in the **Actions** tab
- [ ] **Rotate any password that was ever committed or shared** (Atlas user, JWT secret). `.env` must never be in git
- [ ] Generate a production secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## 1. Database: MongoDB Atlas
1. Create a free M0 cluster, then Database Access: add a user with a strong password
2. Network Access: Add IP address, allow access from anywhere (0.0.0.0/0). Render's IPs change on the free plan
3. Connect, then Drivers: copy the string and put the database name in it:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/estatehub?retryWrites=true&w=majority`
   (URL-encode special characters in the password, e.g. `@` becomes `%40`)

## 2. API: Render
1. Render dashboard, New +, Blueprint, select the repo (it reads `render.yaml`)
2. Fill in the secret variables: `MONGO_URI` (your Atlas string). `CLIENT_URL` comes after step 3
3. Deploy, then open `https://<service>.onrender.com/api/health` and expect `{"status":"ok",...}`
   and `/api/health/ready` should show `"db":"connected"`
4. Seed once from the Render Shell: `node scripts/seedSuperAdmin.js` (set `SUPER_ADMIN_EMAIL` and
   `SUPER_ADMIN_PASSWORD` first). `seedDemo.js` refuses to run in production, so run it with `NODE_ENV=development` only if you want demo data

## 3. Website: Vercel
1. Vercel, Add New, Project, import the repo, **Root Directory: `frontend`**
2. Environment variable: `VITE_API_URL` = `https://<service>.onrender.com/api`
   (Vite reads it at **build time**: change it, then redeploy)
3. Deploy

## 4. Connect them
- Render: `CLIENT_URL` = `https://<project>.vercel.app` (exact origin, no trailing slash)
- Redeploy the API, then run the checklist below

## 5. Smoke-test checklist
- [ ] Home page loads, listings appear
- [ ] Register a customer and an agency, both work
- [ ] Add a property: visible once Available, hidden while Draft
- [ ] Customer sends an inquiry: agency sees a live toast (two browsers)
- [ ] Log in as a different agency: sees none of the first agency's data
- [ ] Refresh on `/dashboard/properties`: no 404
- [ ] DevTools, Network: no CORS errors, WebSocket connects (`101 Switching Protocols`)