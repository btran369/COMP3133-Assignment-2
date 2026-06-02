# ─── Stage 1: Build Angular frontend ──────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npx ng build --configuration production

# ─── Stage 2: Production server ──────────────────────
FROM node:20-alpine
WORKDIR /app

# Copy backend
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --omit=dev

COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 4000

CMD ["node", "backend/src/server.js"]
