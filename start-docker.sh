#!/bin/bash

# Face Attendance System - Quick Setup Script
# This script will build and start all Docker services

echo "🐳 Face Attendance System Docker Setup"
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

echo "📁 Found docker-compose.yml"

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down

# Build and start services
echo "🔨 Building Docker images and starting services..."
echo "This may take a few minutes on first run..."

docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."

if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "🎉 Success! All services are running."
    echo ""
    echo "📋 Service URLs:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:5000"
    echo "   Database:  localhost:3306"
    echo ""
    echo "📊 To view logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 To stop services:"
    echo "   docker-compose down"
    echo ""
else
    echo "❌ Some services failed to start. Check logs:"
    docker-compose logs
    exit 1
fi