# Start NestJS Backend Server
Write-Host "🚀 Starting NSE Query Builder Backend..." -ForegroundColor Green
Write-Host "📊 Database: MySQL (localhost:3306/option_data)" -ForegroundColor Cyan
Write-Host "🌐 Server will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is running
$mysqlService = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue
if ($mysqlService -and $mysqlService.Status -eq "Running") {
    Write-Host "✅ MySQL service is running" -ForegroundColor Green
} else {
    Write-Host "❌ MySQL service is not running!" -ForegroundColor Red
    Write-Host "   Please start MySQL first using: net start MySQL80 (as Administrator)" -ForegroundColor Yellow
    Write-Host ""
}

# Start the backend
npm run start:dev