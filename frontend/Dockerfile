# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean npm cache and install with maximum compatibility settings
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --force --no-fund --no-audit

# Copy source code
COPY . .

# Build application
ARG REACT_APP_API_BASE_URL=http://localhost:8000/api
ARG REACT_APP_WS_URL=ws://localhost:8000/ws
ARG REACT_APP_ENV=production

ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL
ENV REACT_APP_ENV=$REACT_APP_ENV

# Clean node_modules cache before build
RUN npm cache clean --force

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve and curl for healthcheck
RUN npm install -g serve && apk add --no-cache curl

# Copy built application from builder
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Start application
CMD ["serve", "-s", "build", "-l", "3000"]
