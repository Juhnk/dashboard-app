# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/

# Install dependencies
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy source code
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build the API
WORKDIR /app/apps/api
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 mustache
RUN adduser --system --uid 1001 api

# Copy built application
COPY --from=builder --chown=api:mustache /app/apps/api/dist ./dist
COPY --from=builder --chown=api:mustache /app/apps/api/package*.json ./
COPY --from=deps --chown=api:mustache /app/node_modules ./node_modules

# Create logs directory
RUN mkdir -p logs && chown api:mustache logs

USER api

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3001}/api/v1/health || exit 1

EXPOSE ${PORT:-3001}

# Production optimizations
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=1024"

CMD ["node", "dist/main.js"]