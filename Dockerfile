# ==============================================
# SINGLE DOCKERFILE - FULL STACK BUILD
# ==============================================

# ------------------------
# 1) FRONTEND BUILD STAGE
# ------------------------
FROM node:18-alpine AS frontend-builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend/ ./
RUN pnpm run build

# ------------------------
# 2) BACKEND BUILD STAGE  
# ------------------------
FROM node:18-alpine AS backend-builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app/backend
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY backend/ ./
# TypeScript build if needed
RUN if [ -f "tsconfig.json" ]; then pnpm run build; fi

# ------------------------
# 3) PRODUCTION RUNTIME
# ------------------------
FROM node:18-alpine AS runner

# Install nginx for serving frontend
RUN apk add --no-cache nginx

# Setup directories
WORKDIR /app
RUN mkdir -p /var/log/nginx /var/lib/nginx/tmp /run/nginx

# Copy backend
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend/
COPY --from=backend-builder /app/backend/*.js ./backend/
COPY --from=backend-builder /app/backend/routes ./backend/routes
COPY --from=backend-builder /app/backend/models ./backend/models

# Copy frontend build to nginx
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Nginx configuration
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Frontend routes \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # API proxy to backend \
    location /api { \
        proxy_pass http://localhost:5000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/http.d/default.conf

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose ports
EXPOSE 80 5000

# Start script
RUN echo '#!/bin/sh \
echo "🚀 Starting Full Stack Application..." \
echo "📱 Frontend: http://localhost:80" \
echo "🔧 Backend API: http://localhost:5000" \
\
# Start backend in background \
cd /app/backend && node server.js & \
\
# Start nginx in foreground \
nginx -g "daemon off;"' > /start.sh

RUN chmod +x /start.sh

CMD ["/start.sh"]