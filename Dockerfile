# Multi-Stage Production Dockerfile for SprintFlow Enterprise

# --- Stage 1: Build Frontend Assets ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Production Server ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install backend dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Copy built frontend assets to be served statically
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 5000

CMD ["node", "src/server.js"]
