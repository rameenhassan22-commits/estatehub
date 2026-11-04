# syntax=docker/dockerfile:1

# ---------- Stage 1: build the React app ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Vite bakes VITE_* variables into the JavaScript at BUILD time (the browser can't read server env vars),
# so the API address must be passed as a build argument:  docker build --build-arg VITE_API_URL=https://api.example.com/api
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Stage 2: serve the static files with nginx (no Node needed in production) ----------
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1