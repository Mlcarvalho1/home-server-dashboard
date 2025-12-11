# =============================================================================
# Server Nexus - Production Dockerfile
# Optimized for Raspberry Pi (ARM64) and Portainer Git Deployment
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build React Frontend
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy all frontend source files
COPY src/ ./src/
COPY public/ ./public/
COPY index.html vite.config.ts tailwind.config.ts postcss.config.js tsconfig*.json components.json ./

# Build the frontend for production
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Build Go Backend
# -----------------------------------------------------------------------------
FROM golang:1.22-alpine AS backend-builder

WORKDIR /app

# Copy Go module files first for better layer caching
COPY backend/go.mod backend/go.sum* ./

# Download dependencies
RUN go mod download

# Copy backend source code
COPY backend/ .

# Create static directory and copy frontend build
RUN mkdir -p static
COPY --from=frontend-builder /app/dist/ ./static/

# Build the binary for ARM64 (Raspberry Pi)
ENV CGO_ENABLED=0
ENV GOOS=linux
ENV GOARCH=arm64

RUN go build -ldflags="-w -s" -o server-nexus .

# -----------------------------------------------------------------------------
# Stage 3: Final Production Image (~25MB)
# -----------------------------------------------------------------------------
FROM alpine:3.19

# Install minimal runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy the compiled binary
COPY --from=backend-builder /app/server-nexus .

# Environment
ENV PORT=8080
ENV TZ=America/Sao_Paulo

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/system || exit 1

CMD ["./server-nexus"]
