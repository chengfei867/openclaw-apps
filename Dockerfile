# Stage 1: Build frontend
FROM registry.baidubce.com/csm-offline/vibe-kanban:1.0.0 AS frontend-build
WORKDIR /build
COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

# Stage 2: Production image
FROM registry.baidubce.com/csm-offline/vibe-kanban:1.0.0
WORKDIR /app
COPY backend/ ./backend/
RUN cd backend && npm install --production
COPY --from=frontend-build /build/static ./static/
EXPOSE 3030
CMD ["node", "backend/src/index.js"]
