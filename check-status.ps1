# Face Attendance System Status Check Script

Write-Host "`n=== Face Attendance System Status Check ===" -ForegroundColor Cyan
Write-Host "Time: $(Get-Date)" -ForegroundColor Gray

# Check Python processes
Write-Host "`n[Backend Server]" -ForegroundColor Yellow
$pythonProcess = Get-Process python* -ErrorAction SilentlyContinue
if ($pythonProcess) {
    Write-Host "OK Backend server is running (PID: $($pythonProcess.Id))" -ForegroundColor Green
    
    # Test backend API
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/students" -Method GET -TimeoutSec 2
        Write-Host "OK Backend API is responding (Status: $($response.StatusCode))" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR Backend API is not responding" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor DarkRed
    }
}
else {
    Write-Host "ERROR Backend server is NOT running" -ForegroundColor Red
    Write-Host "  Run: cd backend; python app_demo.py" -ForegroundColor Yellow
}

# Check Node processes
Write-Host "`n[Frontend Server]" -ForegroundColor Yellow
$nodeProcess = Get-Process node* -ErrorAction SilentlyContinue
if ($nodeProcess) {
    Write-Host "OK Frontend server is running (PID: $($nodeProcess.Id -join ', '))" -ForegroundColor Green
    
    # Test frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 2
        Write-Host "OK Frontend is responding (Status: $($response.StatusCode))" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR Frontend is not responding" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor DarkRed
    }
}
else {
    Write-Host "ERROR Frontend server is NOT running" -ForegroundColor Red
    Write-Host "  Run: npm run dev" -ForegroundColor Yellow
}

# Check ports
Write-Host "`n[Port Status]" -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port5000) {
    Write-Host "OK Port 5000 (Backend) is in use" -ForegroundColor Green
}
else {
    Write-Host "ERROR Port 5000 (Backend) is free" -ForegroundColor Red
}

if ($port3000) {
    Write-Host "OK Port 3000 (Frontend) is in use" -ForegroundColor Green
}
else {
    Write-Host "ERROR Port 3000 (Frontend) is free" -ForegroundColor Red
}

# Check file structure
Write-Host "`n[File Structure]" -ForegroundColor Yellow
$requiredPaths = @(
    "app",
    "components",
    "backend",
    "backend/app_demo.py",
    "package.json",
    ".env.local"
)

foreach ($path in $requiredPaths) {
    if (Test-Path $path) {
        Write-Host "OK $path exists" -ForegroundColor Green
    }
    else {
        Write-Host "ERROR $path is missing" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n[Summary]" -ForegroundColor Yellow
$backendOk = $null -ne $pythonProcess
$frontendOk = $null -ne $nodeProcess

if ($backendOk -and $frontendOk) {
    Write-Host "OK System is READY!" -ForegroundColor Green
    Write-Host "`nAccess the application at:" -ForegroundColor Cyan
    Write-Host "  http://localhost:3000" -ForegroundColor White
    Write-Host "`nAvailable pages:" -ForegroundColor Cyan
    Write-Host "  - Dashboard: http://localhost:3000" -ForegroundColor White
    Write-Host "  - Students: http://localhost:3000/students" -ForegroundColor White
    Write-Host "  - Reports: http://localhost:3000/reports" -ForegroundColor White
    Write-Host "  - Settings: http://localhost:3000/settings" -ForegroundColor White
}
else {
    Write-Host "ERROR System is NOT ready. Please start the missing services." -ForegroundColor Red
    
    if (-not $backendOk) {
        Write-Host "`nTo start backend:" -ForegroundColor Yellow
        Write-Host "  cd backend" -ForegroundColor White
        Write-Host "  python app_demo.py" -ForegroundColor White
    }
    
    if (-not $frontendOk) {
        Write-Host "`nTo start frontend:" -ForegroundColor Yellow
        Write-Host "  npm run dev" -ForegroundColor White
    }
}

Write-Host "`n=========================================" -ForegroundColor Cyan