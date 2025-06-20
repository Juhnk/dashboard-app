# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/worker/package*.json ./apps/worker/
COPY packages/types/package*.json ./packages/types/

# Install dependencies
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy source code
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build the worker
WORKDIR /app/apps/worker
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 mustache
RUN adduser --system --uid 1001 worker

# Copy built application
COPY --from=builder --chown=worker:mustache /app/apps/worker/dist ./dist
COPY --from=builder --chown=worker:mustache /app/apps/worker/package*.json ./
COPY --from=deps --chown=worker:mustache /app/node_modules ./node_modules

# Create logs directory
RUN mkdir -p logs && chown worker:mustache logs

USER worker

# No health check for worker (it's a background service)
# Monitoring is done through job queue and logging

# Production optimizations
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

CMD ["node", "dist/main.js"]