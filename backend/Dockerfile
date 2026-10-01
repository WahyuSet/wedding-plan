# Backend WeddingPlan + build frontend yang disajikan di domain undangan (INVITATION_URL).
# Build context HARUS akar repo, bukan folder backend:
#   docker build -f backend/Dockerfile -t weddingplan-api .
# SQLite + upload disimpan di volume /data (jalankan HANYA 1 instance).

# Build frontend. Tidak butuh VITE_API_URL: di domain undangan API dipanggil di origin yang sama.
FROM node:22-slim AS web
WORKDIR /web
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-slim AS build
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY backend/package*.json ./
RUN npm ci
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production \
    PORT=5000 \
    DATABASE_URL=file:/data/wedding.db \
    UPLOAD_DIR=/data/uploads \
    INVITATION_DIST_DIR=/app/web
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=web /web/dist ./web
COPY backend/package*.json ./
RUN mkdir -p /data && chown -R node:node /data /app
USER node
VOLUME ["/data"]
EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
