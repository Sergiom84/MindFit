@echo off
echo Iniciando backend MindFit (Node.js)...

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js no está instalado o no está en el PATH
    pause
    exit /b 1
)

REM Verificar si las dependencias están instaladas
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)

REM Ejecutar el servidor en modo desarrollo
echo Iniciando servidor en modo desarrollo...
npm run dev

pause
