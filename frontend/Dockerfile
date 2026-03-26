# Multi-stage build for production
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files for workspace
COPY package.json yarn.lock ./
COPY frontend/package.json ./frontend/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy frontend source
COPY frontend ./frontend

# Build frontend with API URL
WORKDIR /app/frontend
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL
RUN yarn build

# Production stage with nginx
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built files to nginx
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5173/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
