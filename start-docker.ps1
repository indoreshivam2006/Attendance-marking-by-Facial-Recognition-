# Face Attendance System - Quick Setup Script (Windows)
# This script will build and start all Docker services

Write-Host "Face Attendance System Docker Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "[OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if docker-compose.yml exists
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "[ERROR] docker-compose.yml not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Found docker-compose.yml" -ForegroundColor Green

# Stop any existing containers
Write-Host "[INFO] Stopping any existing containers..." -ForegroundColor Yellow
docker-compose down

# Build and start services
Write-Host "[INFO] Building Docker images and starting services..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow

docker-compose up --build -d

# Wait for services to be ready
Write-Host "[INFO] Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep 10

# Check if services are running
Write-Host "[INFO] Checking service status..." -ForegroundColor Yellow

$status = docker-compose ps
if ($status -match "Up") {
    Write-Host ""
    Write-Host "[SUCCESS] All services are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service URLs:" -ForegroundColor Cyan
    Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend:   http://localhost:5000" -ForegroundColor White
    Write-Host "   Database:  localhost:3306" -ForegroundColor White
    Write-Host ""
    Write-Host "To view logs:" -ForegroundColor Cyan
    Write-Host "   docker-compose logs -f" -ForegroundColor White
    Write-Host ""
    Write-Host "To stop services:" -ForegroundColor Cyan
    Write-Host "   docker-compose down" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "X Some services failed to start. Check logs:" -ForegroundColor Red
    docker-compose logs
    exit 1
}