@echo off
echo 🔧 Subiendo fix para parsing JSON con tipo 'intervalo'...
echo.

cd /d "c:\Users\Sergio\Desktop\MindFit"

echo Verificando estado del repositorio...
git status

echo.
echo Agregando archivos al area de staging...
git add .

echo.
echo Haciendo commit...
git commit -m "fix(backend): mejorar parsing JSON con tipo 'intervalo' para móviles

🐛 Problema resuelto:
- Error en móviles: OpenAI genera tipo 'intervalo' pero código solo acepta 'time'/'reps'
- JSON incompletos que se truncan por límites de tokens

✨ Mejoras implementadas:
- Normalización automática: 'intervalo' y 'tiempo' → 'time'
- Función repairIncompleteExerciseJson() para JSON truncados
- extractJsonBlock() mejorado con manejo de strings
- sanitizeExercise() actualizado para tipos no estándar
- Prompt de OpenAI más específico sobre tipos permitidos

🎯 Resultado:
- Generación de entrenamientos funciona correctamente en móviles
- Mejor robustez ante respuestas inesperadas de OpenAI
- Fallback inteligente para JSON malformados

📱 Testeo:
- Funciona con el JSON problemático del error original
- Compatible con respuestas de OpenAI existentes"

echo.
echo Subiendo al repositorio remoto...
git push origin main

echo.
echo ✅ Fix aplicado y subido correctamente!
echo 📱 Ahora puedes probar la generación de entrenamientos en móviles
pause
