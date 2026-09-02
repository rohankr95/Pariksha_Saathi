# Multi-stage build → a small, non-root production image running the
# Next.js "standalone" server output. Built for a private VPS deployment
# via docker-compose (see docker-compose.yml) — not for NIC/SDC hosting.

# ── deps: install once, cached across builds unless package*.json change ──
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts: the postinstall (`prisma generate`) needs prisma/schema.prisma,
# which isn't copied into this stage — the builder stage generates it explicitly
# once the full source is present.
RUN npm ci --ignore-scripts

# ── builder: generate Prisma client + compile the Next.js app ─────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time-only placeholders — `next build` needs *a* DATABASE_URL to
# resolve Prisma's generated client, but touches no real database; the
# actual value is supplied at container runtime via docker-compose/.env.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ── runner: minimal runtime image ──────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Standalone output already contains a pruned node_modules + server.js;
# static assets and public files are copied alongside it.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma schema + migrations are needed at runtime for `prisma migrate deploy`
# (run as a one-off via docker-compose, see README §Deployment).
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Local file storage (STORAGE_DRIVER=local) persists here — mount a volume
# at this path in docker-compose to survive container recreation.
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
