# Stage 1: Build
FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Pre-initialize DB with WAL mode so build workers only read, never write-lock
RUN mkdir -p data && node -e "const D=require('better-sqlite3');const d=new D('data/zhijian.db');d.pragma('journal_mode=WAL');d.pragma('busy_timeout=5000');d.pragma('foreign_keys=ON');d.close()"
RUN npm run build

# Stage 2: Runtime
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/db ./db
COPY --from=builder /app/drizzle.config.ts ./
COPY init-db.js ./

# Entrypoint: auto-init db, then start server
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'node /app/init-db.js' >> /app/entrypoint.sh && \
    echo 'exec node server.js' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

RUN mkdir -p /app/data/uploads
VOLUME /app/data

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
