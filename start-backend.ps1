# Script de PowerShell para iniciar el backend de MindFit

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Iniciando MindFit Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js no está instalado" -ForegroundColor Red
    exit 1
}

# Cambiar al directorio backend
Set-Location backend

# Verificar dependencias
if (!(Test-Path "node_modules")) {
    Write-Host "🔄 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Verificar archivo .env
if (!(Test-Path ".env")) {
    Write-Host "⚠️ Archivo .env no encontrado. Copiando desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Edita backend/.env y configura tu OPENAI_API_KEY" -ForegroundColor Yellow
}

# Probar conexión a la base de datos
Write-Host "🔄 Probando conexión a PostgreSQL..." -ForegroundColor Yellow
try {
    node quick-test.js
    Write-Host "✅ Base de datos conectada correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error conectando a la base de datos" -ForegroundColor Red
    Write-Host "   Asegúrate de que PostgreSQL esté ejecutándose" -ForegroundColor Red
    Write-Host "   Host: localhost:5432, DB: mindfit, User: postgres" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Iniciando servidor en puerto 5000..." -ForegroundColor Green
Write-Host "📍 Health check: $env:VITE_API_URL/health" -ForegroundColor Cyan
Write-Host ""

# Iniciar servidor
node server.js
