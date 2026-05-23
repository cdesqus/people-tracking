# Deployment Guide - CCTV Face Recognition Dashboard

Complete guide for deploying the CCTV Face Recognition Dashboard to development, staging, and production environments.

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Local Development Setup](#local-development-setup)
4. [Staging Deployment](#staging-deployment)
5. [Production Deployment](#production-deployment)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Backup and Disaster Recovery](#backup-and-disaster-recovery)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Supported Environments

- **Development**: Local machine with Docker Compose
- **Staging**: AWS EC2 with RDS PostgreSQL, ElastiCache Redis
- **Production**: High-availability setup with load balancing, auto-scaling, CDN

### Technology Stack

- Frontend: React 18 + Vite
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL 15
- Cache: Redis 7
- AWS Services: Rekognition, S3, IAM, CloudWatch
- Infrastructure: Docker, Docker Compose, AWS EC2, RDS, ElastiCache
- Reverse Proxy: Nginx

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All unit tests passing: `npm test` (frontend), `pytest` (backend)
- [ ] Integration tests passing: `pytest tests/test_integration.py`
- [ ] No linting errors: `npm run lint` (frontend), `pylint app` (backend)
- [ ] Code coverage >= 80%
- [ ] No console errors in browser dev tools
- [ ] Security vulnerabilities scanned: `npm audit`, `safety check`

### Infrastructure

- [ ] Servers provisioned and accessible
- [ ] Database created and optimized
- [ ] S3 bucket created with proper permissions
- [ ] IAM roles and policies configured
- [ ] Security groups configured
- [ ] SSL/TLS certificates generated/obtained
- [ ] DNS records configured
- [ ] VPN/SSH access configured

### Configuration

- [ ] Environment variables defined for all environments
- [ ] AWS credentials securely stored (not in code)
- [ ] Database credentials secured
- [ ] API keys and secrets managed (AWS Secrets Manager or similar)
- [ ] Email service configured (if applicable)
- [ ] Backup strategy documented

### Data

- [ ] Database migrations tested in staging
- [ ] Sample/test data prepared
- [ ] Database backups verified
- [ ] Data migration scripts tested (if applicable)

---

## Local Development Setup

### Quick Start (One Command)

```bash
# Clone the repository
git clone https://github.com/your-org/cctv-dashboard.git
cd cctv-dashboard

# Copy environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Start all services with Docker Compose
docker-compose up --build

# In another terminal, run migrations (first time only)
docker-compose exec backend alembic upgrade head

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/v1
# API Docs: http://localhost:8000/docs
```

### Individual Service Access

```bash
# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis

# Access database directly
docker-compose exec postgres psql -U cctv_user -d cctv_db

# Access Redis CLI
docker-compose exec redis redis-cli

# Stop all services
docker-compose down

# Remove all data (WARNING: deletes database)
docker-compose down -v
```

### Development Workflow

```bash
# 1. Make code changes (hot reload is enabled)
# 2. Run tests
docker-compose exec backend pytest tests/
docker-compose exec frontend npm test

# 3. Check logs for errors
docker-compose logs backend

# 4. Rebuild specific service if needed
docker-compose build backend
docker-compose up -d backend
```

---

## Staging Deployment

### Prerequisites

- AWS Account with appropriate permissions
- EC2 instance (t3.large or larger, Ubuntu 22.04)
- RDS PostgreSQL database instance
- ElastiCache Redis instance
- S3 bucket for faces
- Domain name and SSL certificate
- Nginx installed

### Step 1: Provision AWS Resources

```bash
# Create EC2 instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.large \
  --key-name your-key-pair \
  --security-groups cctv-sg \
  --iam-instance-profile Name=cctv-role \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=cctv-staging}]' \
  --region us-east-1

# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier cctv-staging-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username admin \
  --master-user-password ${DB_PASSWORD} \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --db-subnet-group-name cctv-db-subnet \
  --vpc-security-group-ids sg-xxxxxxxx \
  --backup-retention-period 30 \
  --multi-az \
  --region us-east-1

# Create ElastiCache Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id cctv-staging-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --security-group-ids sg-xxxxxxxx \
  --region us-east-1

# Create S3 bucket
aws s3 mb s3://cctv-staging-faces --region us-east-1
aws s3api put-bucket-versioning \
  --bucket cctv-staging-faces \
  --versioning-configuration Status=Enabled
aws s3api block-public-access-blocking \
  --bucket cctv-staging-faces \
  --public-access-block-configuration \
    'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'
```

### Step 2: Prepare EC2 Instance

```bash
# Connect to instance
ssh -i your-key-pair.pem ubuntu@your-instance-ip

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker and Docker Compose
sudo apt-get install -y docker.io docker-compose git curl wget

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Nginx
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install certbot for SSL
sudo apt-get install -y certbot python3-certbot-nginx
```

### Step 3: Clone and Configure Application

```bash
# Clone repository
git clone https://github.com/your-org/cctv-dashboard.git
cd cctv-dashboard

# Create environment files
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://admin:${DB_PASSWORD}@cctv-staging-db.xxxxxx.rds.amazonaws.com:5432/cctv_db

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
S3_BUCKET=cctv-staging-faces

# Security
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
ALGORITHM=HS256

# Redis
REDIS_URL=redis://cctv-staging-redis.xxxxxx.ng.0001.use1.cache.amazonaws.com:6379

# Server
DEBUG=False
ENVIRONMENT=staging
LOG_LEVEL=INFO
