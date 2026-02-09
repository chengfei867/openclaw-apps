FROM registry.baidubce.com/csm-offline/vibe-kanban:1.0.0

WORKDIR /app
COPY package.json ./
COPY backend/package.json ./backend/
RUN npm install
COPY . .

ENV PORT=3030
EXPOSE 3030
CMD ["node", "backend/server.js"]
