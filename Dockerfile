# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY tailwind.config.js ./
COPY components.json ./
COPY theme.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build frontend
RUN npm run build

# Build stage for backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ libsecret

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies
RUN npm ci

# Production stage
FROM node:20-alpine

# Install runtime dependencies for keytar
RUN apk add --no-cache libsecret

WORKDIR /app

# Copy built frontend from builder
COPY --from=frontend-builder /app/dist ./dist

# Copy backend from builder
COPY --from=backend-builder /app/server ./server

# Copy backend source
COPY server/index.js ./server/

# Create data directory for persistent storage
RUN mkdir -p /data

# Expose ports
EXPOSE 3001 5000

# Install http-server to serve frontend
RUN npm install -g http-server

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cd /app/server && node index.js &' >> /app/start.sh && \
    echo 'cd /app && http-server dist -p 5000 -c-1' >> /app/start.sh && \
    chmod +x /app/start.sh

# Set environment variable for data directory
ENV DATA_DIR=/data

CMD ["/app/start.sh"]
