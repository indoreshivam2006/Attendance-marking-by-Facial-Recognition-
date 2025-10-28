# Simple Docker Startup Script for Face Attendance System
# Run this after ensuring Docker Desktop is running

Write-Host "=== Face Attendance System Docker Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if docker-compose.yml exists
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "[ERROR] docker-compose.yml not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[INFO] Starting Docker containers..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes on first run (downloading images)..." -ForegroundColor Yellow
Write-Host ""

try {
    # Remove version warning by updating docker-compose.yml temporarily
    # Start the services
    docker-compose up --build
} catch {
    Write-Host "[ERROR] Failed to start services!" -ForegroundColor Red
    Write-Host "Make sure Docker Desktop is running and try again." -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Open Docker Desktop" -ForegroundColor White
    Write-Host "2. Wait for it to show 'Engine running'" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] Services should be running!" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application:" -ForegroundColor Cyan
Write-Host "  Main App: http://localhost:3000" -ForegroundColor White
Write-Host "  API:      http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow