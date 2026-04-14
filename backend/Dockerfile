# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL deps (including devDeps needed for prisma generate)
# We add openssl just in case, though slim usually has what Prisma needs
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-slim AS production

WORKDIR /app

# Install openssl for Prisma in production
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema + generated client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma/

# Copy application source
COPY src ./src/
COPY public ./public/

# The node image already includes a user named "node"
RUN chown -R node:node /app

USER node

EXPOSE 4000

# Run migrations then start server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss || echo 'WARNING: Prisma schema sync failed' ; node src/server.js"]
