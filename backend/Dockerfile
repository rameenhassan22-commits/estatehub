# syntax=docker/dockerfile:1

# ---------- Stage 1: install production dependencies only ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# "npm ci" = exact versions from package-lock.json (reproducible builds); --omit=dev = no test/dev tools in the image
RUN npm ci --omit=dev

# ---------- Stage 2: the small runtime image ----------
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Never run as root inside a container: if the app is hacked, the attacker is a powerless user
USER node

EXPOSE 5000

# The platform / compose asks this every 30s: "are you alive?"
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# EXEC form (JSON array) is important: node becomes the main process and receives SIGTERM directly,
# so our graceful shutdown runs. "CMD npm start" would swallow the signal.
CMD ["node", "server.js"]
