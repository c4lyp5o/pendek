# ---------------------------------------------------------------------------
# pendek — all-in-one image (Bun + Elysia backend serving the built Vite SPA)
# Build: docker build -t pendek .
# Run:   docker run -p 5000:5000 --env-file backend/.env pendek
# ---------------------------------------------------------------------------

# --- Stage 1: build the frontend -------------------------------------------
FROM oven/bun:1.4-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lock* ./
RUN bun install --frozen-lockfile
COPY frontend/ ./
RUN bun run build

# --- Stage 2: install backend deps (production only) ------------------------
FROM oven/bun:1.4-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/bun.lock* ./
RUN bun install --frozen-lockfile --production

# --- Final stage -------------------------------------------------------------
FROM oven/bun:1.4-alpine

RUN apk add --no-cache tzdata curl openssl libc6-compat
ENV TZ=Asia/Kuala_Lumpur \
	NODE_ENV=production \
	PORT=5000

WORKDIR /app/backend

COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend/ ./
COPY --from=frontend /app/frontend/dist ../frontend/dist

# Prisma engines + client were generated in backend-deps' install; generate
# again here defensively so the client matches this stage's schema copy.
RUN bunx prisma generate --schema prisma/schema.prisma

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
	CMD curl -fsS http://localhost:5000/api/session || exit 1

# Apply schema at container start (needs live DB; never at build time).
# This project manages schema via `db push` (no migrations/ dir), so we do
# the same here, then serve.
CMD ["sh", "-c", "bunx prisma db push --schema prisma/schema.prisma && exec bun index.js"]
