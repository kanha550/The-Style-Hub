# Stage 1: Build the frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend
COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

# Stage 2: Set up the production environment
FROM node:20-slim
WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/
RUN npm install --prefix backend --production

# Copy backend source code
COPY backend/ ./backend/

# Copy the built frontend to the expected location
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Cloud Run uses port 8080 by default
EXPOSE 8080

# Start the server
CMD ["node", "backend/server.js"]
