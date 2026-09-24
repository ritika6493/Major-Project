# Production-ready Multi-stage Dockerfile for Wanderlust
FROM node:24-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./

# Stage 1: Dependencies
FROM base AS dependencies
RUN npm ci --omit=dev

# Stage 2: Runner
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Set correct permissions
RUN chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 8080

CMD ["node", "app.js"]
