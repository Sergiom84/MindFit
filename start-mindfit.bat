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
echo 1. Iniciando Backend (Node.js/Express)...
echo    Puerto: 5000
echo    Endpoints: /api/evaluar-espacio-imagen, /api/evaluar-espacio-texto
echo.

REM Iniciar backend en una nueva ventana
start "MindFit Backend" cmd /k "cd backend && npm run dev"

REM Esperar un poco para que el backend se inicie
timeout /t 3 /nobreak >nul

echo 2. Iniciando Frontend (React/Vite)...
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
echo Backend API: http://localhost:5000
echo Frontend:    http://localhost:5173
echo Health Check: http://localhost:5000/health
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
echo (Los servidores seguirán ejecutándose en sus ventanas)
pause >nul
