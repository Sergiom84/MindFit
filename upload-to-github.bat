@echo off
echo Subiendo cambios al repositorio GitHub...
echo.

cd /d "c:\Users\Sergio\Desktop\MindFit"

echo Verificando estado del repositorio...
git status

echo.
echo Agregando archivos al area de staging...
git add .

echo.
echo Haciendo commit...
git commit -m "🎨 Enhanced login UI design and 🔧 fixed Render database connection

✨ Features:
- Enhanced login page with professional glass morphism design
- Improved typography and spacing for better UX
- Added elegant hover effects and animations
- Optimized layout to fit screen without scrolling

🔧 Backend Fixes:
- Fixed database connection configuration for Render
- Changed DB_ENVIRONMENT from 'local' to 'render' in .env
- Added comprehensive database connection testing scripts
- Verified PostgreSQL connection and schema integrity

📁 New Files:
- DIAGNOSTIC_REPORT.md: Complete database diagnostic report
- backend/test-render-connection.js: Connection testing utility
- backend/diagnose-config.js: Configuration diagnostic tool
- backend/test-server.js: Server testing utility
- backend/test-register.js: Registration endpoint testing

🎯 Results:
- Login UI now responsive and professional
- Backend successfully connected to Render PostgreSQL
- Database schema verified and functional
- All endpoints ready for production use"

echo.
echo Subiendo al repositorio remoto...
git push origin main

echo.
echo ✅ Proceso completado!
pause
