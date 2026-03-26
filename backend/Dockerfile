# Multi-stage build for production optimization
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files for workspace
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy backend source
COPY backend ./backend

# Build TypeScript
WORKDIR /app/backend
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/backend/package.json ./backend/

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy built files
COPY --from=builder /app/backend/dist ./backend/dist

WORKDIR /app/backend

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]
