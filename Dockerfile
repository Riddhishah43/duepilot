FROM node:20-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
EXPOSE 5000
CMD ["node", "server.js"]

FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=backend /app/backend ./backend
COPY --from=frontend /app/frontend/dist ./frontend/dist
RUN npm install -g serve
EXPOSE 5000 3000
CMD ["sh", "-c", "node backend/server.js & serve -s frontend/dist -l 3000"]
