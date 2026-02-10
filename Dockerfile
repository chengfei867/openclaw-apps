# Stage 1: Build frontend
FROM registry.baidubce.com/csm-offline/vibe-kanban:1.0.0 AS frontend-build
WORKDIR /build
COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

# Stage 2: Build backend (native deps)
FROM registry.baidubce.com/csm-offline/vibe-kanban:1.0.0 AS backend-build
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/ ./backend/
RUN cd backend && npm install --omit=dev

# Stage 3: Production image
FROM registry.baidubce.com/csm-offline/vibe-kanban:1.0.0
WORKDIR /app
COPY --from=backend-build /app/backend ./backend/
COPY --from=frontend-build /build/static ./static/
EXPOSE 3030
CMD ["node", "backend/src/index.js"]
