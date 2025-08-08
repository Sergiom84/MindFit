@echo off
echo ========================================
echo    Iniciando MindFit App Completa
echo ========================================

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js no está instalado
    pause
    exit /b 1
)

echo.
echo 1. Verificando base de datos PostgreSQL...
echo    Host: localhost:5432
echo    Base de datos: mindfit
echo    Usuario: postgres
echo.

REM Verificar conexión a la base de datos
cd backend
node quick-test.js
if errorlevel 1 (
    echo.
    echo ❌ Error: No se pudo conectar a PostgreSQL
    echo    Asegúrate de que PostgreSQL esté instalado y ejecutándose
    echo    con usuario 'postgres' y contraseña 'postgres'
    echo.
    echo 📋 Configuración requerida:
    echo    Host: localhost
    echo    Puerto: 5432
    echo    Usuario: postgres
    echo    Contraseña: postgres
    echo    Base de datos: mindfit
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ Base de datos PostgreSQL conectada correctamente
echo.
echo 2. Iniciando Backend (Node.js/Express)...
echo    Puerto: 5000
echo    Endpoints: /api/login, /api/register, /api/activar-ia-adaptativa
echo.

REM Iniciar backend en una nueva ventana
start "MindFit Backend" cmd /k "cd backend && node server.js"

REM Esperar un poco para que el backend se inicie
timeout /t 3 /nobreak >nul

echo 3. Iniciando Frontend (React/Vite)...
echo    Puerto: 5173 o 5174
echo    URL: http://localhost:5173
echo.

REM Iniciar frontend en una nueva ventana
start "MindFit Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   MindFit App iniciada correctamente!
echo ========================================
echo.
echo 🚀 Backend API: http://localhost:5000
echo 🚀 Backend API: %VITE_API_URL%
echo 🏥 Health Check: %VITE_API_URL%/health
echo 🗄️ Base de datos: PostgreSQL localhost:5432
echo.
echo 📋 Usuario de prueba:
echo    Email: test@example.com
echo    Contraseña: password123
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
echo (Los servidores seguirán ejecutándose en sus ventanas)
pause >nul
