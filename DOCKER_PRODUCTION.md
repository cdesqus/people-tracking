# Production Docker Setup - CCTV Face Recognition Dashboard

Complete production-grade Docker configuration for CCTV Face Recognition Dashboard deployment.

## Docker Compose Production Configuration

### File: docker-compose.prod.yml

```yaml
version: '3.8'

services:
  frontend:
    image: cctv-dashboard-frontend:latest
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - BUILD_ENV=production
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=https://api.cctv.com/api/v1
      - VITE_WS_URL=wss://api.cctv.com/ws
      - VITE_APP_NAME=CCTV Dashboard
      - VITE_APP_VERSION=${APP_VERSION}
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - cctv-network
    restart: always
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M

  backend:
    image: cctv-dashboard-backend:latest
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        - BUILD_ENV=production
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://cctv_user:${DB_PASSWORD}@postgres:5432/cctv_db
      - REDIS_URL=redis://redis:6379
      - AWS_REGION=${AWS_REGION}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - S3_BUCKET=${S3_BUCKET}
      - SECRET_KEY=${SECRET_KEY}
      - ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=60
      - DEBUG=False
      - LOG_LEVEL=INFO
      - WORKERS=4
      - ENVIRONMENT=production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: >
      sh -c "alembic upgrade head &&
             gunicorn app.main:app 
               --workers 4
               --worker-class uvicorn.workers.UvicornWorker
               --bind 0.0.0.0:8000
               --timeout 120
               --access-logfile -
               --error-logfile -"
    volumes:
      - ./backend/logs:/app/logs
    networks:
      - cctv-network
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 2G
        reservations:
          cpus: '2'
          memory: 1G
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: cctv_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: cctv_db
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations/init.sql:/docker-entrypoint-initdb.d/01-init.sql
      - postgres_backups:/backups
    networks:
      - cctv-network
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cctv_user -d cctv_db"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - cctv-network
    restart: always
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  postgres_data:
    driver: local
  postgres_backups:
    driver: local
  redis_data:
    driver: local

networks:
  cctv-network:
    driver: bridge
```

## Production Dockerfile - Backend

```dockerfile
FROM python:3.11-slim as builder

WORKDIR /app
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* && \
    pip install gunicorn uvicorn[standard]

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["sh", "-c", "alembic upgrade head && gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000"]
```

## Production Dockerfile - Frontend

```dockerfile
FROM node:18-alpine as dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY . .
ENV VITE_API_BASE_URL=https://api.cctv.com/api/v1
ENV VITE_WS_URL=wss://api.cctv.com/ws
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

CMD ["serve", "-s", "dist", "-l", "3000"]
```

## Production Environment Variables

### backend/.env.production

```
# Database
DATABASE_URL=postgresql://cctv_user:PRODUCTION_PASSWORD@postgres:5432/cctv_db
DB_POOL_SIZE=30
DB_MAX_OVERFLOW=50

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=PRODUCTION_KEY
AWS_SECRET_ACCESS_KEY=PRODUCTION_SECRET
S3_BUCKET=cctv-production-faces
AWS_REKOGNITION_CONFIDENCE_THRESHOLD=85

# Security
SECRET_KEY=LONG_RANDOM_SECRET_KEY_MIN_32_CHARS
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=PRODUCTION_REDIS_PASSWORD
REDIS_DB=0
REDIS_CACHE_TTL=3600

# Server Configuration
DEBUG=False
WORKERS=4
LOG_LEVEL=WARNING
ENVIRONMENT=production
CORS_ORIGINS=["https://cctv.com","https://api.cctv.com"]

# Email
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SENDGRID_API_KEY
SENDER_EMAIL=alerts@cctv.com

# Monitoring
SENTRY_DSN=https://YOUR_SENTRY_KEY@sentry.io/PROJECT_ID
DATADOG_API_KEY=DATADOG_KEY
DATADOG_SITE=datadoghq.com

# Feature Flags
FEATURE_FACE_DETECTION=true
FEATURE_VISITOR_MANAGEMENT=true
FEATURE_ANALYTICS=true
FEATURE_EMAIL_ALERTS=true
```

## Deployment Steps

### 1. Pre-Deployment Validation

```bash
#!/bin/bash
set -e

echo "Running pre-deployment checks..."

# Build images
docker-compose -f docker-compose.prod.yml build

# Run tests
docker-compose run --rm backend pytest tests/
docker-compose run --rm frontend npm test

# Check image sizes
echo "Backend image size:"
docker image inspect cctv-dashboard-backend:latest | grep Size

echo "Frontend image size:"
docker image inspect cctv-dashboard-frontend:latest | grep Size

echo "All checks passed!"
```

### 2. Registry Push (Private Docker Registry)

```bash
#!/bin/bash
REGISTRY="registry.cctv.com"
VERSION="1.0.0"

echo "Pushing images to registry..."

docker tag cctv-dashboard-backend:latest $REGISTRY/cctv-dashboard-backend:$VERSION
docker tag cctv-dashboard-backend:latest $REGISTRY/cctv-dashboard-backend:latest
docker push $REGISTRY/cctv-dashboard-backend:$VERSION
docker push $REGISTRY/cctv-dashboard-backend:latest

docker tag cctv-dashboard-frontend:latest $REGISTRY/cctv-dashboard-frontend:$VERSION
docker tag cctv-dashboard-frontend:latest $REGISTRY/cctv-dashboard-frontend:latest
docker push $REGISTRY/cctv-dashboard-frontend:$VERSION
docker push $REGISTRY/cctv-dashboard-frontend:latest

echo "Images pushed successfully!"
```

### 3. Secrets Management

```bash
#!/bin/bash
# Store secrets in AWS Secrets Manager

aws secretsmanager create-secret \
  --name cctv/production/env \
  --secret-string file://secrets.json

# Rotate credentials periodically
aws secretsmanager rotate-secret \
  --secret-id cctv/production/env \
  --rotation-rules AutomaticallyAfterDays=30
```

### 4. Health Check Script

```bash
#!/bin/bash
TIMEOUT=5
RETRIES=3

check_service() {
  local service=$1
  local port=$2
  local endpoint=$3
  
  for i in {1..${RETRIES}}; do
    if curl -s -m ${TIMEOUT} http://localhost:${port}${endpoint} > /dev/null; then
      echo "✓ $service is healthy"
      return 0
    fi
    echo "Attempt $i/$RETRIES for $service..."
    sleep 2
  done
  
  echo "✗ $service failed health check"
  return 1
}

echo "Running health checks..."
check_service "Backend" 8000 "/api/v1/health"
check_service "Frontend" 3000 "/"
check_service "Database" 5432 ""

echo "All services healthy!"
```

## Production Monitoring

### Prometheus Metrics Collection

```yaml
# backend/prometheus_config.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'cctv-backend'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
```

### Log Aggregation

```bash
# docker-compose.prod.yml additions for ELK stack
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
    labels: "com.example.env=production"
```

## Backup Strategy

### Automated Database Backups

```bash
#!/bin/bash
# backup.sh - Run via cron job

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

docker-compose exec -T postgres pg_dump \
  -U cctv_user cctv_db | gzip > \
  ${BACKUP_DIR}/cctv_db_${DATE}.sql.gz

# Upload to S3
aws s3 cp ${BACKUP_DIR}/cctv_db_${DATE}.sql.gz \
  s3://cctv-backups/databases/

# Cleanup old backups (keep 30 days)
find ${BACKUP_DIR} -name "cctv_db_*.sql.gz" -mtime +30 -delete
```

### Cron Job Setup

```bash
# Add to /etc/crontab
# Daily backup at 2 AM
0 2 * * * /root/backup.sh >> /var/log/cctv-backup.log 2>&1

# Weekly full backup at Sunday 3 AM
0 3 * * 0 /root/full-backup.sh >> /var/log/cctv-backup.log 2>&1
```

## Security Hardening

### Image Scanning

```bash
# Scan images for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image cctv-dashboard-backend:latest

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image cctv-dashboard-frontend:latest
```

### Network Security

```yaml
# Production network configuration
networks:
  cctv-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.enable_ip_masquerade: "true"
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Secrets in Environment

```bash
# Never commit secrets - use .env.production.local (gitignored)
# Load from secure source during deployment

# Example: AWS Systems Manager Parameter Store
docker-compose config | \
  COMPOSE_FILE=/dev/stdin \
  docker-compose up -d
```

---

**Last Updated**: May 2026
**Version**: 1.0.0
