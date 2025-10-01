# Backend Dockerfile for Medusa v2
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Medusa backend only
RUN npm run build

# Fix admin build directory - copy client to admin folder and root
RUN cp -r .medusa/client .medusa/admin
RUN cp .medusa/client/index.html .medusa/index.html

# Production stage
# Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 medusa

# Copy package files and node_modules
COPY --from=builder --chown=medusa:nodejs /app/package*.json ./
COPY --from=builder --chown=medusa:nodejs /app/node_modules ./node_modules

# Copy build output
COPY --from=builder --chown=medusa:nodejs /app/.medusa ./.medusa

# Copy source files needed for runtime
COPY --from=builder --chown=medusa:nodejs /app/medusa-config.ts ./
COPY --from=builder --chown=medusa:nodejs /app/instrumentation.ts ./
COPY --from=builder --chown=medusa:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=medusa:nodejs /app/src ./src

# CRITICAL FIX: Copy admin files to the path Medusa actually looks for
RUN mkdir -p public/admin
RUN cp .medusa/server/public/admin/index.html public/admin/ || echo "Admin index.html not found, continuing..."

# Copy all admin static assets too
RUN cp -r .medusa/server/public/admin/* public/admin/ 2>/dev/null || echo "No additional admin assets found"

USER medusa

EXPOSE 9000

CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]
