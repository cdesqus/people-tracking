#!/bin/bash

# Docker Fix Deployment Script
# Usage: bash deploy-docker-fix.sh

set -e

echo "================================================"
echo "Docker Error Fix - Deployment Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ docker-compose not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Stopping all containers...${NC}"
docker-compose down
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

echo -e "${YELLOW}Step 2: Rebuilding images without cache...${NC}"
docker-compose build --no-cache
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Images rebuilt successfully${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 3: Starting services...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Services started${NC}"
echo ""

echo -e "${YELLOW}Step 4: Waiting for services to be ready (30s)...${NC}"
sleep 30
echo -e "${GREEN}✓ Ready${NC}"
echo ""

echo -e "${YELLOW}Step 5: Checking service status...${NC}"
echo ""
docker-compose ps
echo ""

echo -e "${YELLOW}Step 6: Testing backend health...${NC}"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    echo "Checking logs..."
    docker-compose logs backend | tail -20
fi
echo ""

echo -e "${YELLOW}Step 7: Testing frontend...${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${RED}✗ Frontend is not responding${NC}"
    echo "Checking logs..."
    docker-compose logs frontend | tail -20
fi
echo ""

echo "================================================"
echo -e "${GREEN}✓ Deployment Complete${NC}"
echo "================================================"
echo ""
echo "Services should now be running and healthy."
echo ""
echo "Access points:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo ""
echo "Check status anytime with:"
echo "  docker-compose ps"
echo ""
echo "View logs with:"
echo "  docker-compose logs -f [backend|frontend]"
echo ""
