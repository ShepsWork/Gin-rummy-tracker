#!/bin/bash

# Deploy script for Gin Rummy Tracker
# Pulls latest image and restarts container

set -e

echo "🚀 Deploying Gin Rummy Tracker..."

cd /opt/gin-rummy

# Pull latest image
echo "📥 Pulling latest image..."
docker-compose pull

# Restart container
echo "♻️  Restarting container..."
docker-compose up -d

# Wait for container to be ready
echo "⏳ Waiting for container to be healthy..."
sleep 2

# Health check
echo "🏥 Running health check..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
  echo "✅ Deployment successful"
  exit 0
else
  echo "❌ Health check failed"
  exit 1
fi
