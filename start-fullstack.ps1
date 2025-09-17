# NSE Query Builder - Full Stack Startup Script
Write-Host "🚀 Starting NSE Query Builder Full Stack Application" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Cyan

# Check if MySQL is running
Write-Host "📊 Checking MySQL service..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue
if ($mysqlService -and $mysqlService.Status -eq "Running") {
    Write-Host "✅ MySQL service is running" -ForegroundColor Green
} else {
    Write-Host "❌ MySQL service is not running!" -ForegroundColor Red
    Write-Host "   Please start MySQL first: Right-click 'start-mysql.bat' -> Run as administrator" -ForegroundColor Yellow
    Read-Host "Press Enter when MySQL is running to continue..."
}

Write-Host ""
Write-Host "🔧 Building backend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend build successful" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Starting servers..." -ForegroundColor Yellow
    Write-Host "   Backend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Instructions:" -ForegroundColor White
    Write-Host "   1. Backend will start first" -ForegroundColor Gray
    Write-Host "   2. Open a NEW PowerShell window" -ForegroundColor Gray
    Write-Host "   3. Run: cd frontend && npm run dev" -ForegroundColor Gray
    Write-Host "   4. Open http://localhost:5173 in your browser" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🚀 Starting backend server..." -ForegroundColor Green
    
    # Start backend
    npm run start
} else {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
}