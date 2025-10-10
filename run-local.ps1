# PowerShell script to run the face attendance system locally

Write-Host "Face Attendance System - Local Development Setup" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✓ Python version: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python is not installed. Please install Python first." -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ package.json not found" -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "`nInstalling backend dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\requirements.txt") {
    Set-Location "backend"
    
    # Try to create virtual environment
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    
    # Activate virtual environment
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    .\venv\Scripts\Activate.ps1
    
    # Install requirements
    Write-Host "Installing Python packages..." -ForegroundColor Yellow
    pip install -r requirements.txt
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Backend dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
        Write-Host "Note: Face recognition libraries require additional system dependencies" -ForegroundColor Yellow
        Write-Host "Consider using Docker for easier setup" -ForegroundColor Yellow
    }
    
    Set-Location ..
} else {
    Write-Host "✗ backend\requirements.txt not found" -ForegroundColor Red
    exit 1
}

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "`nTo run the application:" -ForegroundColor Cyan
Write-Host "1. Start the backend: cd backend && python simple_server.py" -ForegroundColor White
Write-Host "2. Start the frontend: npm run dev" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White

Write-Host "`nNote: Using simple_server.py for development without face recognition" -ForegroundColor Yellow
Write-Host "For full face recognition features, use Docker setup" -ForegroundColor Yellow