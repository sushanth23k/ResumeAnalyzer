# ============================================================
# Resume Analyzer Frontend — Dockerfile
# Multi-stage build: Node.js (build) → Nginx (serve)
# ============================================================

# ── Stage 1: Build React application ──────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install all dependencies (devDependencies are required by Vite at build time)
RUN npm ci && npm cache clean --force

COPY . .

# VITE_API_BASE_URL is baked into the JS bundle at build time.
# Pass the backend URL via --build-arg or the docker-compose `args` section.
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────────────────
FROM nginx:1.25-alpine

RUN apk add --no-cache curl

# Remove default static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Use the project's custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
